import {
  CodeBlockLowlight,
  type CodeBlockLowlightOptions,
} from '@tiptap/extension-code-block-lowlight';
import type { Extension } from '@tiptap/vue-3';
import { createLowlight } from 'lowlight';
import css from 'highlight.js/lib/languages/css';
import js from 'highlight.js/lib/languages/javascript';
import ts from 'highlight.js/lib/languages/typescript';
import html from 'highlight.js/lib/languages/xml';
import python from 'highlight.js/lib/languages/python';

const lowlight = createLowlight();

lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('ts', ts);
lowlight.register('js', js);
lowlight.register('python', python);

export const Codeblock = CodeBlockLowlight.configure({
  lowlight,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as Extension<CodeBlockLowlightOptions, any>;
