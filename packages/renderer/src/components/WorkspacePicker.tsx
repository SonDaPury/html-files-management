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
        title: 'Lỗi',
        description: 'Không thể chọn thư mục làm việc',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isButton) {
    return (
      <Button variant="outline" onClick={handleChooseWorkspace}>
        Đổi thư mục làm việc
      </Button>
    );
  }

  return (
    <Box textAlign="center" p={8}>
      <VStack spacing={6}>
        <Box>
          <Heading size="xl" mb={2}>
            Trình quản lý tệp HTML
          </Heading>
          <Text color="gray.600">
            Chọn thư mục làm việc để bắt đầu
          </Text>
        </Box>
        
        <Button
          colorScheme="blue"
          size="lg"
          onClick={handleChooseWorkspace}
        >
          Chọn thư mục làm việc
        </Button>
        
        <Text fontSize="sm" color="gray.500" maxW="md">
          Chọn thư mục mà bạn muốn quản lý các tệp HTML. 
          Ứng dụng chỉ truy cập các tệp trong thư mục này.
        </Text>
      </VStack>
    </Box>
  );
}

export default WorkspacePicker;