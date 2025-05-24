declare module 'pdfkit' {
  import { EventEmitter } from 'events';

  class PDFDocument extends EventEmitter {
    constructor(options?: PDFDocumentOptions);
    
    // Text methods
    text(text: string, x?: number, y?: number, options?: TextOptions): this;
    fontSize(size: number): this;
    font(font: string): this;
    
    // Graphics methods
    rect(x: number, y: number, width: number, height: number): this;
    circle(x: number, y: number, radius: number): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    stroke(): this;
    fill(color?: string): this;
    
    // Image methods
    image(src: string, x: number, y: number, options?: ImageOptions): this;
    
    // Document methods
    addPage(options?: PDFDocumentOptions): this;
    end(): this;
    
    // Properties
    page: {
      width: number;
      height: number;
    };
  }

  interface PDFDocumentOptions {
    size?: string | [number, number];
    layout?: 'portrait' | 'landscape';
    margin?: number | { top: number; left: number; bottom: number; right: number };
    info?: {
      Title?: string;
      Author?: string;
      Subject?: string;
      Keywords?: string;
    };
    autoFirstPage?: boolean;
    bufferPages?: boolean;
  }

  interface TextOptions {
    width?: number;
    align?: 'left' | 'center' | 'right' | 'justify';
    lineBreak?: boolean;
  }

  interface ImageOptions {
    width?: number;
    height?: number;
    scale?: number;
    fit?: [number, number];
    align?: 'left' | 'center' | 'right';
    valign?: 'top' | 'center' | 'bottom';
  }

  export default PDFDocument;
} 