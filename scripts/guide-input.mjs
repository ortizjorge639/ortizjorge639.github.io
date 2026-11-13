import { projects } from '../src/projects.ts';
import { GuideError } from './guide-sources.mjs';

// Shared input contract only. Public hosting never imports the loopback CLI server.
export const LIMITS = { body: 16_384, question: 1200, history: 6, message: 1000, timeout: 90_000 };
export function validateInput(value) {
  const fail = () => { throw new GuideError('invalid_input', 'Send a question (1–1200 characters), a valid projectId or null, and at most six user/assistant messages (1–1000 characters each).'); };
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).some(key => !['question', 'projectId', 'history'].includes(key)) ||
      typeof value.question !== 'string' || !value.question.trim() || value.question.length > LIMITS.question ||
      !(value.projectId === null || projects.some(project => project.id === value.projectId)) ||
      !Array.isArray(value.history) || value.history.length > LIMITS.history) fail();
  const history = value.history.map(message => {
    if (!message || typeof message !== 'object' || Object.keys(message).some(key => !['role', 'content'].includes(key)) ||
        !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string' ||
        !message.content.trim() || message.content.length > LIMITS.message) fail();
    return { role: message.role, content: message.content };
  });
  return { question: value.question.trim(), projectId: value.projectId, history };
}
