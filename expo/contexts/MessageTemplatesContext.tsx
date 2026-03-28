import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MessageTemplate } from '@/types';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'message_templates';

const DEFAULT_TEMPLATES: Omit<MessageTemplate, 'id' | 'userId'>[] = [
  {
    name: 'Greeting',
    content: 'Hi! Thanks for your interest. I\'d be happy to discuss your project in more detail.',
    category: 'greeting',
  },
  {
    name: 'Request More Info',
    content: 'Thanks for reaching out! Could you provide more details about your project timeline and specific requirements?',
    category: 'followup',
  },
  {
    name: 'Schedule Meeting',
    content: 'I\'m available to meet and discuss your project. When would work best for you?',
    category: 'availability',
  },
  {
    name: 'Send Quote',
    content: 'Based on the details you provided, I\'ve prepared a quote for your review. Please let me know if you have any questions.',
    category: 'quote',
  },
  {
    name: 'Follow Up',
    content: 'Just following up on our previous conversation. Have you had a chance to review the information I sent?',
    category: 'followup',
  },
];

export const [MessageTemplatesProvider, useMessageTemplates] = createContextHook(() => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTemplates = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const all = JSON.parse(stored);
        const userTemplates = all.filter((t: MessageTemplate) => t.userId === user?.id);
        setTemplates(userTemplates);
      } else if (user) {
        const defaultWithUser = DEFAULT_TEMPLATES.map((t, idx) => ({
          ...t,
          id: `template_${Date.now()}_${idx}`,
          userId: user.id,
        }));
        setTemplates(defaultWithUser);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWithUser));
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user, loadTemplates]);

  const createTemplate = useCallback(async (data: {
    name: string;
    content: string;
    category: MessageTemplate['category'];
  }) => {
    if (!user) return;

    const newTemplate: MessageTemplate = {
      id: `template_${Date.now()}`,
      userId: user.id,
      name: data.name,
      content: data.content,
      category: data.category,
    };

    const updated = [...templates, newTemplate];
    setTemplates(updated);

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const all = stored ? JSON.parse(stored) : [];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...all, newTemplate]));
    } catch (error) {
      console.error('Failed to save template:', error);
    }

    return newTemplate;
  }, [user, templates]);

  const updateTemplate = useCallback(async (
    templateId: string,
    updates: Partial<Pick<MessageTemplate, 'name' | 'content' | 'category'>>
  ) => {
    const updated = templates.map(t =>
      t.id === templateId ? { ...t, ...updates } : t
    );
    setTemplates(updated);

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const all = stored ? JSON.parse(stored) : [];
      const allUpdated = all.map((t: MessageTemplate) =>
        t.id === templateId ? { ...t, ...updates } : t
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allUpdated));
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  }, [templates]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    const updated = templates.filter(t => t.id !== templateId);
    setTemplates(updated);

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const all = stored ? JSON.parse(stored) : [];
      const allUpdated = all.filter((t: MessageTemplate) => t.id !== templateId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allUpdated));
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  }, [templates]);

  const getTemplatesByCategory = useCallback((category: MessageTemplate['category']) => {
    return templates.filter(t => t.category === category);
  }, [templates]);

  return useMemo(() => ({
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByCategory,
  }), [templates, loading, createTemplate, updateTemplate, deleteTemplate, getTemplatesByCategory]);
});
