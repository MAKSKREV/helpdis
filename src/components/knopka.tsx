import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { PDFDocument } from 'pdf-lib';


interface PageSize {
  width: number;
  height: number;
}

const PdfViewer: React.FC = () => {
  const [numPages, setNumPages] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [sizes, setSizes] = useState<Record<string, number>>({
    A4: 0,
    A3: 0,
    A2: 0,
    A1: 0,
    A0: 0,
    nonStandard: 0,
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const countPagesBySize = async (pdf: File): Promise<Record<string, number>> => {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = async (event) => {
        const target = event.target;
        if (target) {
          const arrayBuffer = target.result as ArrayBuffer;
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const pages = pdfDoc.getPages();

          const sizes: Record<string, number> = {
            A4: 0,
            A3: 0,
            A2: 0,
            A1: 0,
            A0: 0,
            nonStandard: 0,
          };

          pages.forEach((page) => {
            const pageSize: PageSize = page.getSize();
            const width = pageSize.width;
            const height = pageSize.height;

            const getPageSizeType = ({ width, height }: PageSize) => {
              const a4Width = 210;
              const a4Height = 297;
              const tolerance = 5; // 1% tolerance
            
              if (Math.abs((width - a4Width) / a4Width) < tolerance && Math.abs((height - a4Height) / a4Height) < tolerance) {
                return 'A4';
              } else if (Math.abs((width - 297) / 297) < tolerance && Math.abs((height - 420) / 420) < tolerance) {
                return 'A3';
              } else if (Math.abs((width - 420) / 420) < tolerance && Math.abs((height - 594) / 594) < tolerance) {
                return 'A2';
              } else if (Math.abs((width - 594) / 594) < tolerance && Math.abs((height - 841) / 841) < tolerance) {
                return 'A1';
              } else if (Math.abs((width - 841) / 841) < tolerance && Math.abs((height - 1189) / 1189) < tolerance) {
                return 'A0';
              } else {
                return 'nonStandard';
              }
            };
            const pageSizeType = getPageSizeType(pageSize);
            sizes[pageSizeType]++;
          });

          resolve(sizes);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsArrayBuffer(pdf);
    });
  };

  const handleFileUpload = async () => {
    if (file) {
      const sizes = await countPagesBySize(file);
      setSizes(sizes);
    }
  };

  return (
    <div>
      <input type="file" onChange={onFileChange} />
      <button onClick={handleFileUpload}>Upload</button>

      {file && (
        <Document file={file}>
          {Array.from(new Array(numPages), (el, index) => (
            <Page key={`page_${index + 1}`} pageNumber={index + 1} />
          ))}
        </Document>
      )}

      <div>
        {Object.keys(sizes).map((size) => (
          <p key={size}>{size}: {sizes[size]}шт</p>
        ))}
      </div>
    </div>
  );
};

export default PdfViewer;