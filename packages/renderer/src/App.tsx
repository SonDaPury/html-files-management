import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Button,
  Text,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { FileItem } from './types';
import WorkspacePicker from './components/WorkspacePicker';
import FileList from './components/FileList';
import EditorModal from './components/EditorModal';

function App() {
  const [workspace, setWorkspace] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const toast = useToast();

  const loadWorkspace = async () => {
    try {
      const currentWorkspace = await window.electron.getWorkspace();
      setWorkspace(currentWorkspace);
      if (currentWorkspace) {
        await loadFiles(currentWorkspace);
      }
    } catch (error) {
      console.error('Failed to load workspace:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải thư mục làm việc',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = async (workspacePath: string) => {
    try {
      const fileList = await window.electron.listFiles(workspacePath);
      setFiles(fileList);
    } catch (error) {
      console.error('Failed to load files:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách tệp',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleWorkspaceSelect = async (workspacePath: string) => {
    setWorkspace(workspacePath);
    await loadFiles(workspacePath);
    toast({
      title: 'Thành công',
      description: `Đã đặt thư mục làm việc tại: ${workspacePath}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleNewFile = () => {
    if (!workspace) return;
    setEditingFile(null);
    setIsEditorOpen(true);
  };

  const handleEditFile = async (file: FileItem) => {
    try {
      const { content } = await window.electron.readFile(file.path);
      setEditingFile({ ...file, content } as FileItem & { content: string });
      setIsEditorOpen(true);
    } catch (error) {
      console.error('Failed to read file:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể đọc tệp',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteFile = async (file: FileItem) => {
    try {
      await window.electron.deleteFile(file.path, true);
      toast({
        title: 'Thành công',
        description: `Đã xóa tệp: ${file.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      if (workspace) {
        await loadFiles(workspace);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa tệp',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleOpenFile = async (file: FileItem) => {
    try {
      await window.electron.openExternal(file.path);
    } catch (error) {
      console.error('Failed to open file:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể mở tệp',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSaveFile = async (name: string, content: string) => {
    if (!workspace) return;

    try {
      if (editingFile) {
        // Update existing file
        const newName = name !== editingFile.name ? name : undefined;
        await window.electron.updateFile(editingFile.path, newName, content);
        toast({
          title: 'Thành công',
          description: `Đã cập nhật tệp: ${name}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new file
        await window.electron.createFile(workspace, name, content);
        toast({
          title: 'Thành công',
          description: `Đã tạo tệp: ${name}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      setIsEditorOpen(false);
      setEditingFile(null);
      await loadFiles(workspace);
    } catch (error) {
      console.error('Failed to save file:', error);
      toast({
        title: 'Lỗi',
        description: `Không thể lưu tệp: ${error}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, []);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!workspace) {
    return (
      <Center h="100vh">
        <WorkspacePicker onWorkspaceSelect={handleWorkspaceSelect} />
      </Center>
    );
  }

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Heading size="lg">Trình quản lý tệp HTML</Heading>
            <Text color="gray.600" fontSize="sm" mt={1}>
              Thư mục làm việc: {workspace}
            </Text>
          </Box>
          <HStack>
            <Button colorScheme="blue" onClick={handleNewFile}>
              Tệp mới
            </Button>
            <WorkspacePicker onWorkspaceSelect={handleWorkspaceSelect} isButton />
          </HStack>
        </HStack>

        <FileList
          files={files}
          onEdit={handleEditFile}
          onDelete={handleDeleteFile}
          onOpen={handleOpenFile}
        />

        <EditorModal
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingFile(null);
          }}
          onSave={handleSaveFile}
          file={editingFile}
        />
      </VStack>
    </Box>
  );
}

export default App;