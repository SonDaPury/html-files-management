import React, { useState, useMemo } from 'react';
import {
  Box,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  HStack,
  Text,
  Badge,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { FileItem } from '../types';

interface FileListProps {
  files: FileItem[];
  onEdit: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onOpen: (file: FileItem) => void;
}

function FileList({ files, onEdit, onDelete, onOpen }: FileListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'mtime'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const filteredAndSortedFiles = useMemo(() => {
    let result = files.filter(file =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'mtime') {
        comparison = a.mtime - b.mtime;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [files, searchTerm, sortBy, sortOrder]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const handleSortChange = (newSortBy: 'name' | 'mtime') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  if (files.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500" fontSize="lg">
          No HTML files found in this workspace
        </Text>
        <Text color="gray.400" fontSize="sm" mt={2}>
          Click "New File" to create your first HTML file
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack spacing={4}>
        <Input
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW="300px"
        />
        <Select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [newSortBy, newSortOrder] = e.target.value.split('-') as ['name' | 'mtime', 'asc' | 'desc'];
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
          }}
          maxW="200px"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="mtime-desc">Newest first</option>
          <option value="mtime-asc">Oldest first</option>
        </Select>
      </HStack>

      <Box
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        borderRadius="md"
        overflow="hidden"
      >
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th
                cursor="pointer"
                onClick={() => handleSortChange('name')}
                _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
              >
                File Name
                {sortBy === 'name' && (
                  <Badge ml={2} fontSize="xs">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Badge>
                )}
              </Th>
              <Th>Size</Th>
              <Th
                cursor="pointer"
                onClick={() => handleSortChange('mtime')}
                _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
              >
                Modified
                {sortBy === 'mtime' && (
                  <Badge ml={2} fontSize="xs">
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Badge>
                )}
              </Th>
              <Th width="120px">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredAndSortedFiles.map((file) => (
              <Tr key={file.path}>
                <Td>
                  <Text
                    cursor="pointer"
                    color="blue.500"
                    _hover={{ textDecoration: 'underline' }}
                    onClick={() => onOpen(file)}
                  >
                    {file.name}
                  </Text>
                </Td>
                <Td>{formatFileSize(file.size)}</Td>
                <Td>
                  <Text fontSize="sm" color="gray.600">
                    {formatDate(file.mtime)}
                  </Text>
                </Td>
                <Td>
                  <HStack spacing={1}>
                    <IconButton
                      aria-label="Open file"
                      icon={<ExternalLinkIcon />}
                      size="sm"
                      variant="ghost"
                      onClick={() => onOpen(file)}
                    />
                    <IconButton
                      aria-label="Edit file"
                      icon={<EditIcon />}
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(file)}
                    />
                    <IconButton
                      aria-label="Delete file"
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
                          onDelete(file);
                        }
                      }}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Text fontSize="sm" color="gray.500">
        {filteredAndSortedFiles.length} of {files.length} files
        {searchTerm && ` matching "${searchTerm}"`}
      </Text>
    </VStack>
  );
}

export default FileList;