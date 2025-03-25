'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Title,
  TextInput,
  Select,
  Button,
  Paper,
  Group,
  Stack,
  Text,
  Code,
  CopyButton,
  ColorSwatch,
  Box,
  useMantineTheme
} from '@mantine/core';

const colorOptions = [
  { value: '31', label: 'Red', color: '#ff5555' },
  { value: '32', label: 'Green', color: '#55ff55' },
  { value: '33', label: 'Yellow', color: '#ffff55' },
  { value: '34', label: 'Blue', color: '#5555ff' },
  { value: '35', label: 'Pink', color: '#ff55ff' },
  { value: '36', label: 'Cyan', color: '#55ffff' },
  { value: '37', label: 'White', color: '#ffffff' },
];

const bgOptions = [
  { value: '40', label: 'Black', color: '#000000' },
  { value: '41', label: 'Red', color: '#ff5555' },
  { value: '42', label: 'Green', color: '#55ff55' },
  { value: '43', label: 'Yellow', color: '#ffff55' },
  { value: '44', label: 'Blue', color: '#5555ff' },
  { value: '45', label: 'Purple', color: '#ff55ff' },
  { value: '46', label: 'Cyan', color: '#55ffff' },
  { value: '47', label: 'White', color: '#ffffff' },
];

export default function DiscordGenerator() {
  const theme = useMantineTheme();
  const [rawText, setRawText] = useState('');
  const [styledText, setStyledText] = useState('');
  const [textColor, setTextColor] = useState('37');
  const [bgColor, setBgColor] = useState('40');
  const [previewHtml, setPreviewHtml] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const handleSelection = () => {
    if (textareaRef.current) {
      setSelection({
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd
      });
    }
  };

  const applyStyle = (styleCode: string) => {
    if (!textareaRef.current) return;

    const { selectionStart, selectionEnd, value } = textareaRef.current;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    if (!selectedText) return;

    const ansiStart = `\u001b[${styleCode}m`;
    const ansiEnd = `\u001b[0m`;

    const newText = 
      value.substring(0, selectionStart) + 
      ansiStart + selectedText + ansiEnd + 
      value.substring(selectionEnd);

    setRawText(value);
    setStyledText(newText);
  };

  const handleApply = () => {
    const styles = [];
    if (textColor !== '37') styles.push(textColor);
    if (bgColor !== '40') styles.push(bgColor);

    if (styles.length > 0) {
      applyStyle(styles.join(';'));
    }
  };

  const ansiToHtml = (text: string) => {
    const colors = {
      '30': 'black', '31': '#ff5555', '32': '#55ff55', '33': '#ffff55',
      '34': '#5555ff', '35': '#ff55ff', '36': '#55ffff', '37': 'white',
      '40': 'black', '41': '#ff5555', '42': '#55ff55', '43': '#ffff55',
      '44': '#5555ff', '45': '#ff55ff', '46': '#55ffff', '47': 'white'
    };

    let html = '';
    let currentStyles: string[] = [];
    let buffer = '';

    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) === 27 && text[i + 1] === '[') {
        if (buffer) {
          html += currentStyles.length 
            ? `<span style="${currentStyles.join(';')}">${buffer}</span>` 
            : buffer;
          buffer = '';
        }
        
        const endIdx = text.indexOf('m', i);
        if (endIdx === -1) continue;
        
        const codes = text.slice(i + 2, endIdx).split(';');
        currentStyles = [];
        
        codes.forEach(code => {
          if (code === '0') {
            currentStyles = [];
          } else if (code === '1') {
            currentStyles.push('font-weight:bold');
          } else if (colors[code as keyof typeof colors]) {
            currentStyles.push(
              parseInt(code) >= 40 
                ? `background:${colors[code as keyof typeof colors]}`
                : `color:${colors[code as keyof typeof colors]}`
            );
          }
        });
        
        i = endIdx;
      } else {
        buffer += text[i];
      }
    }

    if (buffer) {
      html += currentStyles.length 
        ? `<span style="${currentStyles.join(';')}">${buffer}</span>`
        : buffer;
    }

    return html || text;
  };

  const updatePreview = () => {
    const preview = ansiToHtml(styledText || rawText);
    const discordCode = `\`\`\`ansi\n${styledText || rawText}\n\`\`\``;
    
    setPreviewHtml(preview);
    setOutputCode(discordCode);
  };

  useEffect(() => {
    updatePreview();
  }, [rawText, styledText]);

  return (
    <Paper p="xl" shadow="sm" radius="md" maw={800} mx="auto" mt={50}>
      <Title order={1} mb="xl" ta="center">
        Discord Colored Text Generator
      </Title>

      <Stack gap="md">
        <TextInput
          ref={textareaRef}
          label="Your Text"
          placeholder="Type your text here..."
          value={rawText}
          onChange={(e) => {
            setRawText(e.target.value);
            if (styledText === '' || e.target.value.length < rawText.length) {
              setStyledText(e.target.value);
            }
          }}
          onSelect={handleSelection}
          autosize
          minRows={4}
        />

        <Text size="sm" c="dimmed" mt={-10} mb={10}>
          {selection.start !== selection.end 
            ? `Selected ${selection.end - selection.start} characters`
            : 'Select text to style'}
        </Text>

        <Group grow>
          <Select
            label="Text Color"
            value={textColor}
            onChange={(value) => setTextColor(value || '37')}
            data={colorOptions.map(opt => ({
              value: opt.value,
              label: (
                <Group gap="sm">
                  <ColorSwatch color={opt.color} size={14} />
                  {opt.label}
                </Group>
              )
            }))}
          />

          <Select
            label="Background Color"
            value={bgColor}
            onChange={(value) => setBgColor(value || '40')}
            data={bgOptions.map(opt => ({
              value: opt.value,
              label: (
                <Group gap="sm">
                  <ColorSwatch color={opt.color} size={14} />
                  {opt.label}
                </Group>
              )
            }))}
          />
        </Group>

        <Group>
          <Button variant="outline" onClick={() => applyStyle('1')}>Bold</Button>
          <Button variant="outline" onClick={() => applyStyle('4')}>Underline</Button>
          <Button variant="outline" onClick={() => applyStyle('3')}>Italic</Button>
          <Button onClick={handleApply} ml="auto">Apply Style</Button>
        </Group>

        <Box>
          <Text fw={500} mb="xs">Preview (Discord appearance):</Text>
          <Paper 
            p="md" 
            bg={theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[1]}
            style={{ minHeight: 60 }}
          >
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </Paper>
        </Box>

        <Box>
          <Text fw={500} mb="xs">Code to Copy:</Text>
          <Code block style={{ 
            whiteSpace: 'pre-wrap', 
            wordBreak: 'break-all',
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[1]
          }}>
            {outputCode}
          </Code>
          <CopyButton value={outputCode}>
            {({ copied, copy }) => (
              <Button 
                fullWidth 
                mt="sm" 
                onClick={copy}
                color={copied ? 'teal' : 'blue'}
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
            )}
          </CopyButton>
        </Box>
      </Stack>
    </Paper>
  );
}