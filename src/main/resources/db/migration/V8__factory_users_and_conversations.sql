-- =================================================================
-- V8: Factory user accounts + WebSocket messaging system
-- =================================================================

-- Add factory user account link
ALTER TABLE factories ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX idx_factories_user_id ON factories(user_id) WHERE user_id IS NOT NULL;

-- =================================================================
-- CONVERSATIONS
-- One conversation per (type, request_id).
-- type: CLIENT_CONSULTANT | CONSULTANT_FACTORY
-- initiator_id: user who triggered the first message
-- participant_id: the other user
-- =================================================================
CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type            VARCHAR(30) NOT NULL CHECK (type IN ('CLIENT_CONSULTANT','CONSULTANT_FACTORY')),
    request_id      UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    initiator_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_conversation_type_request UNIQUE (type, request_id),
    CONSTRAINT chk_different_participants CHECK (initiator_id <> participant_id)
);

CREATE INDEX idx_conversations_request_id  ON conversations(request_id);
CREATE INDEX idx_conversations_initiator   ON conversations(initiator_id);
CREATE INDEX idx_conversations_participant ON conversations(participant_id);
CREATE INDEX idx_conversations_updated_at  ON conversations(updated_at DESC);

-- =================================================================
-- CHAT MESSAGES
-- =================================================================
CREATE TABLE chat_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id, created_at);
CREATE INDEX idx_chat_messages_sender       ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_unread       ON chat_messages(conversation_id, is_read) WHERE is_read = FALSE;

-- Auto-update conversations.updated_at when a message is inserted
CREATE OR REPLACE FUNCTION fn_update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_chat_message_inserted
AFTER INSERT ON chat_messages
FOR EACH ROW EXECUTE FUNCTION fn_update_conversation_timestamp();
