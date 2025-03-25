'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Title,
  Textarea,
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
  useMantineTheme,
  useMantineColorScheme
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
  const { colorScheme } = useMantineColorScheme();
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

    const selectedText = rawText.substring(selection.start, selection.end);
    if (!selectedText) return;

    const ansiStart = `\u001b[${styleCode}m`;
    const ansiEnd = `\u001b[0m`;

    const newStyledText =
      rawText.substring(0, selection.start) +
      ansiStart + selectedText + ansiEnd +
      rawText.substring(selection.end);

    setStyledText(newStyledText);
  };

  const handleApply = () => {
    const styles = [];
    if (textColor !== '37') styles.push(textColor);
    if (bgColor !== '40') styles.push(bgColor);
    if (styles.length > 0) applyStyle(styles.join(';'));
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
          } else if (code === '3') {
            currentStyles.push('font-style:italic');
          } else if (code === '4') {
            currentStyles.push('text-decoration:underline');
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

  useEffect(() => {
    const preview = ansiToHtml(styledText || rawText);
    const discordCode = `\`\`\`ansi\n${styledText || rawText}\n\`\`\``;
    setPreviewHtml(preview);
    setOutputCode(discordCode);
  }, [rawText, styledText]);

  return (
    <Paper p="xl" shadow="sm" radius="md" maw={800} mx="auto" mt={50}>
      <Title order={1} mb="xl" ta="center">
        Discord Colored Text Generator
      </Title>

      <Stack gap="md">
        <Textarea
          ref={textareaRef}
          label="Your Text"
          placeholder="Type your text here..."
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          onSelect={handleSelection}
          autosize
          minRows={4}
        />

        <Group grow>
          <Select
            label="Text Color"
            value={textColor}
            onChange={(value) => setTextColor(value || '37')}
            data={colorOptions.map(opt => ({
              value: opt.value,
              label: opt.label,
              rightSection: <ColorSwatch color={opt.color} size={14} />
            }))}
          />

          <Select
            label="Background Color"
            value={bgColor}
            onChange={(value) => setBgColor(value || '40')}
            data={bgOptions.map(opt => ({
              value: opt.value,
              label: opt.label,
              rightSection: <ColorSwatch color={opt.color} size={14} />
            }))}
          />
        </Group>

        <Button onClick={handleApply} fullWidth>Apply Style</Button>

        <Box>
          <Text fw={500} mb="xs">Preview (Discord appearance):</Text>
          <Paper p="md">
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </Paper>
        </Box>

        <Box>
          <Text fw={500} mb="xs">Code to Copy:</Text>
          <Code block>{outputCode}</Code>
          <CopyButton value={outputCode}>
            {({ copied, copy }) => (
              <Button fullWidth mt="sm" onClick={copy} color={copied ? 'teal' : 'blue'}>
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </Button>
            )}
          </CopyButton>
        </Box>
      </Stack>
    </Paper>
  );
}
