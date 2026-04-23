import os
import zipfile
import xml.etree.ElementTree as ET
import base64
from pathlib import Path


class ImageExtractor:
    def __init__(self):
        self.ns = {'svg': 'http://www.w3.org/2000/svg', 'xlink': 'http://www.w3.org/1999/xlink'}

    @staticmethod
    def is_big_enough(base64_str, min_size_kb=20):
        if "base64," in base64_str:
            base64_str = base64_str.split("base64,")[1]
        file_size_bytes = (len(base64_str) * 3) / 4
        file_size_kb = file_size_bytes / 1024
        return file_size_kb >= min_size_kb

    def extract_images_from_docx(self, docx_path):
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

    def extract_images_from_svg(self, svg_path):
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
            if not self.is_big_enough(img.get('href') or img.get('{http://www.w3.org/1999/xlink}href')):
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

    def save_images(self, files: list[Path]):
        for file_path in files:
            try: 
                if file_path.suffix.lower() == '.docx':
                    self.extract_images_from_docx(file_path)
                elif file_path.suffix.lower() == '.svg':
                    self.extract_images_from_svg(file_path)
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
