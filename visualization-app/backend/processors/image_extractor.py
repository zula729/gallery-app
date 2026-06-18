import os
import zipfile
import xml.etree.ElementTree as ET
import base64
from pathlib import Path


class ImageExtractor:
    """
    Extracts embedded raster images from compressed file formats or markup.
    
    Supports pulling visual media arrays out of OpenXML Microsoft Word documents (.docx) 
    and decoding embedded Base64 vector image resources out of XML-based SVG drawings (.svg).
    """
    def __init__(self):
        self.ns = {'svg': 'http://www.w3.org/2000/svg', 'xlink': 'http://www.w3.org/1999/xlink'}

    @staticmethod
    def _is_above_size_threshold(base64_str, min_size_kb=20):
        """
        Calculates approximate unencoded binary size of a base64 string to check a threshold.

        Uses the structural 3:4 byte ratio formula of base64 encoding to derive 
        on-disk file size without requiring actual data decoding operations.

        Args:
            base64_str (str): Raw string containing base64 data, possibly with URI headers.
            min_size_kb (float): Minimum file size cutoff in kilobytes. Defaults to 20.0.

        Returns:
            bool: True if estimated unencoded file size equals or exceeds the threshold, else False.
        """
        if "base64," in base64_str:
            base64_str = base64_str.split("base64,")[1]
        file_size_bytes = (len(base64_str) * 3) / 4
        file_size_kb = file_size_bytes / 1024
        return file_size_kb >= min_size_kb

    def _extract_from_docx(self, docx_path):
        """
        Extracts embedded raw media items out of a target Microsoft OpenXML Word document.

        Treats the .docx container as a standardized zip file archive and inspects 
        the target nested folder 'word/media/' where visual assets reside.

        Args:
            docx_path (Path): Pathlib object pointing to the source document asset.

        Returns:
            None
        """
        try:
            output_folder = docx_path.parent / "images"
            output_folder.mkdir(parents=True, exist_ok=True)
            index = 0
            with zipfile.ZipFile(docx_path, 'r') as docx_zip:
                for file in docx_zip.namelist():
                    if file.startswith('word/media/'):
                        ext = os.path.splitext(file)[1]
                        new_filename = f"firebase_image{index}{ext}"
                        target_path = os.path.join(output_folder, new_filename)
                        with docx_zip.open(file) as source, open(target_path, "wb") as target:
                            target.write(source.read())
                        print(f"Извлечено: {file}")
                        index += 1
        except Exception as e:
            print(f"Error extracting images from {docx_path}: {e}")

    def _extract_from_svg(self, svg_path):
        """
        Parses an SVG file tree and decodes embedded inline base64 image streams.

        Scans XML elements matching namespace schemas for `<image>` definitions. Checks
        extracted text chunks against dimension parameters before exporting payload to disk.

        Args:
            svg_path (Path): Pathlib object pointing to the target vector graphics source.

        Returns:
            None
        """
        try:
            output_folder = svg_path.parent / "images"
            output_folder.mkdir(parents=True, exist_ok=True)
            tree = ET.parse(svg_path)
        except Exception as e:
            print(f"Error parsing SVG file {svg_path}: {e}")
            return None

        root = tree.getroot()

        images = root.findall('.//svg:image', self.ns) + root.findall('.//image', self.ns)

        for i, img in enumerate(images):
            if not self._is_above_size_threshold(img.get('href') or img.get('{http://www.w3.org/1999/xlink}href')):
                print(f"Skipped image, too small (id: {img.get('id')}), {svg_path}")
                continue
            img_data = img.get('href') or img.get('{http://www.w3.org/1999/xlink}href')
            if not img_data or not img_data.startswith('data:image'):
                continue

            try:
                header, encoded = img_data.split("base64,", 1)
                ext = header.split(';')[0].split('/')[-1]
                content = base64.b64decode(encoded)

                file_path = os.path.join(output_folder, f"firebase_image{img.get('id')}.{ext}")
                with open(file_path, 'wb') as f:
                    f.write(content)
            except Exception as e:
                print(f"Error {i}: {e}")

    def process_files(self, files: list[Path]):
        """
        Iterates over an incoming sequence of files and routes them to correct extractors.

        Identifies input targets according to extension maps and passes individual file 
        paths down to dedicated extraction processing routines.

        Args:
            files (list[Path]): List of fully-qualified pathlib Path items to evaluate.

        Returns:
            None
        """
        for file_path in files:
            try: 
                if file_path.suffix.lower() == '.docx':
                    self._extract_from_docx(file_path)
                elif file_path.suffix.lower() == '.svg':
                    self._extract_from_svg(file_path)
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
