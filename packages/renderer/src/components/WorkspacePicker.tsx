import React from 'react';
import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react';

interface WorkspacePickerProps {
  onWorkspaceSelect: (workspace: string) => void;
  isButton?: boolean;
}

function WorkspacePicker({ onWorkspaceSelect, isButton = false }: WorkspacePickerProps) {
  const toast = useToast();

  const handleChooseWorkspace = async () => {
    try {
      const workspace = await window.electron.chooseWorkspace();
      if (workspace) {
        onWorkspaceSelect(workspace);
      }
    } catch (error) {
      console.error('Failed to choose workspace:', error);
      toast({
        title: 'Error',
        description: 'Failed to choose workspace',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isButton) {
    return (
      <Button variant="outline" onClick={handleChooseWorkspace}>
        Change Workspace
      </Button>
    );
  }

  return (
    <Box textAlign="center" p={8}>
      <VStack spacing={6}>
        <Box>
          <Heading size="xl" mb={2}>
            HTML File Manager
          </Heading>
          <Text color="gray.600">
            Choose a workspace directory to get started
          </Text>
        </Box>
        
        <Button
          colorScheme="blue"
          size="lg"
          onClick={handleChooseWorkspace}
        >
          Choose Workspace
        </Button>
        
        <Text fontSize="sm" color="gray.500" maxW="md">
          Select a folder where you want to manage your HTML files. 
          The app will only access files within this directory.
        </Text>
      </VStack>
    </Box>
  );
}

export default WorkspacePicker;