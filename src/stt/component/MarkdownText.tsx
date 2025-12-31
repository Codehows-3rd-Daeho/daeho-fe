import { Box, Typography } from "@mui/material";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";

const markdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1.5, mt: 0.5 }} {...props}>
      {children}
    </Typography>
  ),
  h2: ({ children, ...props }) => (
    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, mt: 1.25 }} {...props}>
      {children}
    </Typography>
  ),
  h3: ({ children, ...props }) => (
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, mt: 1 }} {...props}>
      {children}
    </Typography>
  ),
  
  p: ({ children, ...props }) => (
    <Typography sx={{ lineHeight: 1.2 }} {...props}>
      {children}
    </Typography>
  ),
  
  // 화자 블록쿼트 - 말풍선 스타일
  blockquote: ({ children, ...props }) => (
    <Box
      component="blockquote"
      sx={{
        position: 'relative',
        backgroundColor: '#e3f2fd',
        borderRadius: '12px 12px 12px 0',
        padding: '6px 8px',
        margin: '12px 0',
        maxWidth: '85%',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        
        '&:nth-of-type(even)': {
          textAlign: 'right',
          marginLeft: 'auto',
          backgroundColor: '#f5f5f5',
          borderRadius: '12px 12px 0 12px',
        }
      }}
      {...props}
    >
      {children}
    </Box>
  ),
  
  strong: ({ children, ...props }) => (
    <Typography 
      component="span" 
      sx={{ fontWeight: 700, color: '#1976d2', display: 'block', mb: 0.5 }} 
      {...props}
    >
      {children}
    </Typography>
  ),
  
  code: ({ children, className, ...props }) => {
    const inline = !className;
    
    return inline ? (
      <Box
        component="code"
        sx={{
          fontFamily: 'Monaco, Menlo, monospace',
          fontSize: '0.875em',
          backgroundColor: 'rgba(0,0,0,0.06)',
          px: 0.75,
          py: 0.25,
          borderRadius: 0.5
        }}
        {...props}
      >
        {children}
      </Box>
    ) : (
      <Box
        component="pre"
        sx={{
          backgroundColor: 'rgba(0,0,0,0.04)',
          borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.1)',
          padding: '12px 16px',
          margin: '16px 0',
          overflowX: 'auto',
          '& code': {
            fontFamily: 'Monaco, Menlo, monospace',
            fontSize: '0.875em'
          }
        }}
      >
        <code className={className} {...props}>
          {children}
        </code>
      </Box>
    );
  },
  
  ul: ({ children, ...props }) => (
    <Box component="ul" sx={{ pl: 2, mb: 1 }} {...props}>
      {children}
    </Box>
  ),
  
  ol: ({ children, ...props }) => (
    <Box component="ol" sx={{ pl: 2, mb: 1 }} {...props}>
      {children}
    </Box>
  ),
  
  li: ({ children, ...props }) => (
    <Box component="li" sx={{ mb: 0.5 }} {...props}>
      {children}
    </Box>
  ),
  
  a: ({ children, ...props }) => (
    <Box
      component="a"
      sx={{
        color: '#1976d2',
        textDecoration: 'none',
        '&:hover': { textDecoration: 'underline' }
      }}
      {...props}
    >
      {children}
    </Box>
  )
};

type MarkdownTextProps = {
  content: string;
}

export default function MarkdownText({content}: MarkdownTextProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={markdownComponents}
    >
      {content}
    </ReactMarkdown>
  )
}