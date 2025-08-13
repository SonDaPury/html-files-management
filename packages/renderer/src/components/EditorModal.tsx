import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  HStack,
  useToast,
  Box,
} from '@chakra-ui/react';
import Editor from '@monaco-editor/react';
import { FileItem } from '../types';

interface EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, content: string) => Promise<void>;
  file?: FileItem & { content?: string } | null;
}

function EditorModal({ isOpen, onClose, onSave, file }: EditorModalProps) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [nameError, setNameError] = useState('');
  const [contentError, setContentError] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      if (file) {
        // Editing existing file
        setName(file.name.replace('.html', ''));
        setContent((file as any).content || '');
      } else {
        // Creating new file
        setName('');
        setContent('<!DOCTYPE html>\n<html>\n<head>\n    <title>New HTML File</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>');
      }
      setNameError('');
      setContentError('');
    }
  }, [isOpen, file]);

  const validateForm = (): boolean => {
    let isValid = true;

    if (!name.trim()) {
      setNameError('File name is required');
      isValid = false;
    } else if (!/^[A-Za-z0-9._-]+$/.test(name.trim())) {
      setNameError('File name can only contain letters, numbers, dots, underscores, and hyphens');
      isValid = false;
    } else {
      setNameError('');
    }

    if (!content.trim()) {
      setContentError('Content is required');
      isValid = false;
    } else {
      setContentError('');
    }

    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await onSave(name.trim(), content);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    
    const hasChanges = file
      ? name !== file.name.replace('.html', '') || content !== (file as any).content
      : name.trim() !== '' || content !== '<!DOCTYPE html>\n<html>\n<head>\n    <title>New HTML File</title>\n</head>\n<body>\n    <h1>Hello World!</h1>\n</body>\n</html>';
    
    if (hasChanges && !window.confirm('You have unsaved changes. Are you sure you want to close?')) {
      return;
    }
    
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl">
      <ModalOverlay />
      <ModalContent maxW="90vw" maxH="90vh">
        <ModalHeader>
          {file ? `Edit ${file.name}` : 'Create New HTML File'}
        </ModalHeader>
        <ModalCloseButton isDisabled={saving} />
        <ModalBody>
          <VStack spacing={4} align="stretch" onKeyDown={handleKeyDown}>
            <FormControl isInvalid={!!nameError}>
              <FormLabel>File Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError('');
                }}
                placeholder="Enter file name (without .html extension)"
                isDisabled={saving}
              />
              <FormErrorMessage>{nameError}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!contentError} flex="1">
              <FormLabel>Content</FormLabel>
              <Box
                border="1px solid"
                borderColor={contentError ? 'red.300' : 'gray.200'}
                borderRadius="md"
                overflow="hidden"
                height="400px"
              >
                <Editor
                  height="400px"
                  language="html"
                  value={content}
                  onChange={(value) => {
                    setContent(value || '');
                    if (contentError) setContentError('');
                  }}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                    fontSize: 14,
                    tabSize: 2,
                    readOnly: saving,
                  }}
                />
              </Box>
              <FormErrorMessage>{contentError}</FormErrorMessage>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleClose} isDisabled={saving}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSave}
              isLoading={saving}
              loadingText="Saving..."
            >
              Save (Ctrl+S)
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default EditorModal;