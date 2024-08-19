import React, { useState } from 'react';
import { Document, Page } from 'react-pdf';
import { PDFDocument } from 'pdf-lib';

interface PageSize {
  width: number;
  height: number;
}

const PdfViewer: React.FC = () => {
  const [numPages] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [sizes, setSizes] = useState<Record<string, number>>({});
  const [colorType, setColorType] = useState<Record<string, 'цветной' | 'чёрно-белый'>>({});
  const [totalPrice, setTotalPrice] = useState(0);

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

          const sizes: Record<string, number> = {};

          pages.forEach((page) => {
            const pageSize: PageSize = page.getSize();
            const mmPerPoint = 0.352777778;
            const widthMM = Math.round(pageSize.width * mmPerPoint);
            const heightMM = Math.round(pageSize.height * mmPerPoint);

            const getPageSizeType = ({ width, height }: PageSize) => {
              const a4Width = 210;
              const a4Height = 297;
              const tolerance = 0.2;

              width = Math.round(width);
              height = Math.round(height);

              if  ((Math.abs((width - a4Width) / a4Width) < tolerance && Math.abs((height - a4Height) / a4Height) < tolerance) ||
              (Math.abs((width - a4Height) / a4Height) < tolerance && Math.abs((height -  a4Width) / a4Width) < tolerance)) {
                   return 'A4';
              } else if ((Math.abs((width - 297) / 297) < tolerance && Math.abs((height - 420) / 420) < tolerance) ||
              (Math.abs((width - 420) / 420) < tolerance && Math.abs((height - 297) / 297) < tolerance)) {
                   return 'A3';
              } else if ((Math.abs((width - 420) / 420) < tolerance && Math.abs((height - 594) / 594) < tolerance) ||
                  (Math.abs((width - 594) / 594) < tolerance && Math.abs((height - 420) / 420) < tolerance)) {
                    return 'A2';
              } else if ((Math.abs((width - 594) / 594) < tolerance && Math.abs((height - 841) / 841) < tolerance) ||
                  (Math.abs((width - 841) / 841) < tolerance && Math.abs((height -  594) /  594) < tolerance)) {
                    return 'A1';
              } else if ((Math.abs((width - 841) / 841) < tolerance && Math.abs((height - 1189) / 1189) < tolerance) ||
                  (Math.abs((width - 1189) / 1189) < tolerance && Math.abs((height -  841) /  841) < tolerance)) {
                       return 'A0';
              } else {
                return `${width}x${height} мм`;
              }
            };
            const pageSizeType = getPageSizeType({ width: widthMM, height: heightMM });
            sizes[pageSizeType] = (sizes[pageSizeType] || 0) + 1;
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
      const colorTypes: Record<string, 'цветной' | 'чёрно-белый'> = {};
      Object.keys(sizes).forEach((size) => {
        colorTypes[size] = 'чёрно-белый'; 
      });
      setColorType(colorTypes);
      calculatePrice(sizes, colorTypes);
    }
  };

  const calculatePrice = (sizes: Record<string, number>, colorTypes: Record<string, 'цветной' | 'чёрно-белый'>) => {
    let totalPrice = 0;
    Object.keys(sizes).forEach((size) => {
      const count = sizes[size];
      const colorType = colorTypes[size];
      let price = 0;
      switch (size) {
        case 'A0':
          price = colorType === 'чёрно-белый' ? 230 : 330;
          break;
        case 'A1':
          price = colorType === 'чёрно-белый' ? 175 : 275;
          break;
        case 'A2':
          price = colorType === 'чёрно-белый' ? 120 : 220;
          break;
        case 'A3':
          if (colorType === 'чёрно-белый') {
            if (count <= 20) {
              price = 45;
            } else if (count <= 49) {
              price = 31;
            } else if (count <= 99) {
              price = 37;
            } else if (count <= 249) {
              price = 33;
            } else {
              price = 29;
            }
          } else {
            if (count <= 20) {
              price = 105;
            } else if (count <= 49) {
              price = 95;
            } else if (count <= 99) {
              price = 85;
            } else if (count <= 499) {
              price = 75;
            } else {
              price = 65;
            }
          }
          break;
        case 'A4':
          if (colorType === 'чёрно-белый') {
            if (count <= 20) {
              price = 20;
            } else if (count <= 49) {
              price = 18;
            } else if (count <= 99) {
              price = 16;
            } else if (count <= 249) {
              price = 14;
            } else {
              price = 12;
            }
          } else {
            if (count <= 20) {
              price = 50;
            } else if (count <= 49) {
              price = 45;
            } else if (count <= 99) {
              price = 40;
            } else if (count <= 499) {
              price = 35;
            } else {
              price = 30;
            }
          }
          break;
        default:
          price = 0;
      }
      totalPrice += price * count;
    });
    setTotalPrice(totalPrice);
  };

  const handleColorTypeChange = (size: string, newColorType: 'цветной' | 'чёрно-белый') => {
    const newColorTypes = { ...colorType };
    newColorTypes[size] = newColorType;
    setColorType(newColorTypes);
    calculatePrice(sizes, newColorTypes);
  };
  const getPrice = (size: string, colorType: 'цветной' | 'чёрно-белый', count: number) => {
    switch (size) {
      case 'A0':
        return colorType === 'чёрно-белый'? 230 * count : 330 * count;
      case 'A1':
        return colorType === 'чёрно-белый'? 175 * count : 275 * count;
      case 'A2':
        return colorType === 'чёрно-белый'? 120 * count : 220 * count;
      case 'A3':
        if (colorType === 'чёрно-белый') {
          if (count <= 20) {
            return 45 * count;
          } else if (count <= 49) {
            return 41 * count;
          } else if (count <= 99) {
            return 37 * count;
          } else if (count <= 249) {
            return 33 * count;
          } else {
            return 29 * count;
          }
        } else {
          if (count <= 20) {
            return 105 * count;
          } else if (count <= 49) {
            return 95 * count;
          } else if (count <= 99) {
            return 85 * count;
          } else if (count <= 499) {
            return 75 * count;
          } else {
            return 65 * count;
          }
        }
      case 'A4':
        if (colorType === 'чёрно-белый') {
          if (count <= 20) {
            return 20 * count;
          } else if (count <= 49) {
            return 18 * count;
          } else if (count <= 99) {
            return 16 * count;
          } else if (count <= 249) {
            return 14 * count;
          } else {
            return 12 * count;
          }
        } else {
          if (count <= 20) {
            return 50 * count;
          } else if (count <= 49) {
            return 45 * count;
          } else if (count <= 99) {
            return 40 * count;
          } else if (count <= 499) {
            return 35 * count;
          } else {
            return 30 * count;
          }
        }
      default:
        return 0;
    }
  };
  return (
    <div>
      <input type="file" onChange={onFileChange} />
      <button onClick={handleFileUpload}>Upload</button>

      {file && (
        <Document file={file}>
          {Array.from(new Array(numPages), (index) => (
            <Page key={`page_${index + 1}`} pageNumber={index + 1} />
          ))}
        </Document>
      )}

<div>
  {Object.keys(sizes).map((size) => (
    <div key={size}>
      <p>
        {size}: {sizes[size]}шт
        <span style={{ marginLeft: 10 }}>
          Стоимость: {getPrice(size, colorType[size], sizes[size])} руб.
        </span>
      </p>
      <select
        value={colorType[size]}
        onChange={(e) => handleColorTypeChange(size, e.target.value as 'цветной' | 'чёрно-белый')}
      >
        <option value="чёрно-белый">Чёрно-белый</option>
        <option value="цветной">Цветной</option>
      </select>
    </div>
  ))}
</div>


      <p>Итого: {totalPrice}руб.</p>
    </div>
  );
};

export default PdfViewer;