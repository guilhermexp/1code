"use client"

import { memo } from "react"
import { useAtomValue } from "jotai"
import { forwardRef, memo, useLayoutEffect, useState } from "react"
import { Virtuoso, type FollowOutput, type VirtuosoHandle } from "react-virtuoso"
import { currentSubChatIdAtom, userMessageIdsPerChatFromMessagesAtom } from "../stores/message-store"
import { USE_VIRTUOSO_CHAT, VIRTUOSO_FOLLOW_BOTTOM_THRESHOLD_PX } from "./chat-render-flags"
import { IsolatedMessageGroup } from "./isolated-message-group"

// ============================================================================
// ISOLATED MESSAGES SECTION (LAYER 3)
// ============================================================================
// Renders ALL message groups by subscribing to userMessageIdsAtom.
// Only re-renders when a new user message is added (new conversation turn).
// Each group independently subscribes to its own data via IsolatedMessageGroup.
//
// During streaming:
// - This component does NOT re-render (userMessageIds don't change)
// - Individual groups don't re-render (their user msg + assistant IDs don't change)
// - Only the AssistantMessageItem for the streaming message re-renders
// ============================================================================

interface IsolatedMessagesSectionProps {
  subChatId: string
  chatId: string
  isMobile: boolean
  isSplitPane?: boolean
  followOutput?: FollowOutput
  scrollParentRef?: React.RefObject<HTMLElement | null>
  onAtBottomStateChange?: (atBottom: boolean) => void
  virtuosoRef?: React.RefObject<VirtuosoHandle | null>
  sandboxSetupStatus: "cloning" | "ready" | "error"
  stickyTopClass: string
  sandboxSetupError?: string
  onRetrySetup?: () => void
  onUrlClick?: (url: string) => void
  // Components passed from parent - must be stable references
  UserBubbleComponent: React.ComponentType<{
    messageId: string
    textContent: string
    imageParts: any[]
    skipTextMentionBlocks?: boolean
  }>
  ToolCallComponent: React.ComponentType<{
    icon: any
    title: string
    isPending: boolean
    isError: boolean
  }>
  MessageGroupWrapper: React.ComponentType<{ children: React.ReactNode; isLastGroup?: boolean }>
  toolRegistry: Record<string, { icon: any; title: (args: any) => string }>
  onRollback?: (userMsg: any) => void
}

function areSectionPropsEqual(
  prev: IsolatedMessagesSectionProps,
  next: IsolatedMessagesSectionProps
): boolean {
  return (
    prev.subChatId === next.subChatId &&
    prev.chatId === next.chatId &&
    prev.isMobile === next.isMobile &&
    prev.isSplitPane === next.isSplitPane &&
    prev.followOutput === next.followOutput &&
    prev.scrollParentRef === next.scrollParentRef &&
    prev.onAtBottomStateChange === next.onAtBottomStateChange &&
    prev.virtuosoRef === next.virtuosoRef &&
    prev.sandboxSetupStatus === next.sandboxSetupStatus &&
    prev.stickyTopClass === next.stickyTopClass &&
    prev.sandboxSetupError === next.sandboxSetupError &&
    prev.onRetrySetup === next.onRetrySetup &&
    prev.onUrlClick === next.onUrlClick &&
    prev.UserBubbleComponent === next.UserBubbleComponent &&
    prev.ToolCallComponent === next.ToolCallComponent &&
    prev.MessageGroupWrapper === next.MessageGroupWrapper &&
    prev.toolRegistry === next.toolRegistry &&
    prev.onRollback === next.onRollback
  )
}

export const IsolatedMessagesSection = memo(function IsolatedMessagesSection({
  subChatId,
  chatId,
  isMobile,
  isSplitPane = false,
  followOutput,
  scrollParentRef,
  onAtBottomStateChange,
  virtuosoRef,
  sandboxSetupStatus,
  stickyTopClass,
  sandboxSetupError,
  onRetrySetup,
  onUrlClick,
  UserBubbleComponent,
  ToolCallComponent,
  MessageGroupWrapper,
  toolRegistry,
  onRollback,
}: IsolatedMessagesSectionProps) {
  // CRITICAL: Check if global atoms are synced for THIS subChat FIRST
  // With keep-alive tabs, multiple ChatViewInner instances exist simultaneously.
  // Global atoms (messageIdsAtom, etc.) contain data from the ACTIVE tab only.
  // When a tab becomes active, useLayoutEffect syncs its messages to global atoms,
  // but that happens AFTER this component renders. So on first render after activation,
  // we might read stale data from the previous active tab.
  //
  // Solution: Check currentSubChatIdAtom BEFORE reading userMessageIdsAtom.
  // If it doesn't match our subChatId, return empty to avoid showing wrong messages.
  // The useLayoutEffect will sync and update currentSubChatIdAtom, which triggers
  // a re-render of this component (since we're subscribed to it).
  const currentSubChatId = useAtomValue(currentSubChatIdAtom)
  const rawUserMsgIds = useAtomValue(userMessageIdsPerChatFromMessagesAtom(subChatId))
  const isActiveChat = currentSubChatId === subChatId
  const shouldRenderForSubChat = isSplitPane || isActiveChat

  // Subscribe to user message IDs - but only use them if we're the active chat
  const userMsgIds = useAtomValue(userMessageIdsAtom)

  // Preserve initial bottom positioning by mounting Virtuoso only once
  // data is available for this sub-chat.
  const hasVirtuosoData = userMsgIds.length > 0
  const shouldDelayVirtuosoMount = useVirtuosoChat && !hasVirtuosoData
  const [scrollParentEl, setScrollParentEl] = useState<HTMLElement | null>(
    () => scrollParentRef?.current ?? null
  )

  useLayoutEffect(() => {
    const nextEl = scrollParentRef?.current ?? null
    setScrollParentEl((prev) => (nextEl && nextEl !== prev ? nextEl : prev))
  }, [scrollParentRef])

  if (!useVirtuosoChat) {
    // Non-Virtuoso path: guard against stale data from other sub-chats
    if (!shouldRenderForSubChat) return null
    return (
      <div
        className="flex flex-col w-full px-2 max-w-2xl mx-auto -mb-4"
        style={{ paddingBottom: "32px" }}
      >
        {rawUserMsgIds.map((userMsgId) => (
          <IsolatedMessageGroup
            key={userMsgId}
            userMsgId={userMsgId}
            subChatId={subChatId}
            chatId={chatId}
            isMobile={isMobile}
            sandboxSetupStatus={sandboxSetupStatus}
            stickyTopClass={stickyTopClass}
            sandboxSetupError={sandboxSetupError}
            onRetrySetup={onRetrySetup}
            onRollback={onRollback}
            UserBubbleComponent={UserBubbleComponent}
            ToolCallComponent={ToolCallComponent}
            MessageGroupWrapper={MessageGroupWrapper}
            toolRegistry={toolRegistry}
          />
        ))}
      </div>
    )
  }

  if (shouldDelayVirtuosoMount) {
    return <div style={{ height: "100%", width: "100%" }} />
  }

  return (
    <>
      {userMsgIds.map((userMsgId) => (
        <IsolatedMessageGroup
          key={userMsgId}
          userMsgId={userMsgId}
          subChatId={subChatId}
          chatId={chatId}
          isMobile={isMobile}
          sandboxSetupStatus={sandboxSetupStatus}
          stickyTopClass={stickyTopClass}
          sandboxSetupError={sandboxSetupError}
          onRetrySetup={onRetrySetup}
          onUrlClick={onUrlClick}
          UserBubbleComponent={UserBubbleComponent}
          ToolCallComponent={ToolCallComponent}
          MessageGroupWrapper={MessageGroupWrapper}
          toolRegistry={toolRegistry}
          onRollback={onRollback}
        />
      ))}
    </>
  )
}, areSectionPropsEqual)
