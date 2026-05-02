import re
import fitz
import docx
from pathlib import Path
from docx.oxml.ns import qn
import pdfplumber


class DocumentProcessor:
    def read_text(self, file_path: Path) -> str:
        if file_path.suffix.lower() == '.pdf':
            return self._read_pdf(file_path)
        if file_path.suffix.lower() == '.docx':
            return self._read_docx(file_path)
        return ""

    def _read_pdf_simpl(self, path: Path) -> str:
        with pdfplumber.open(path) as pdf:
            return "".join(page.extract_text() or "" for page in pdf.pages)
        
    def _read_pdf(self, pdf_path: Path) -> str:
        doc = fitz.open(pdf_path)
        md_lines = []

        for page in doc:
            link_map = {}
            for link in page.get_links():
                if "uri" in link:
                    link_map[tuple(link["from"])] = link["uri"]

            blocks = page.get_text("dict")["blocks"]

            x_positions = [
                block["bbox"][0] for block in blocks
                if block["type"] == 0 and block["lines"]
            ]
            base_x = min(x_positions) if x_positions else 0

            i = 0
            while i < len(blocks):
                block = blocks[i]

                if block["type"] != 0:
                    i += 1
                    continue

                all_spans = [span for line in block["lines"] for span in line["spans"]]

                if all_spans and all(span["size"] < 7 for span in all_spans):
                    i += 1
                    continue

                block_x = block["bbox"][0]
                block_text = " ".join(span["text"] for span in all_spans).strip()

                is_bullet_symbol = block_text in ("•", "-", "–", "*", "·")

                if is_bullet_symbol:
                    if i + 1 < len(blocks) and blocks[i + 1]["type"] == 0:
                        i += 1
                        next_block = blocks[i]
                        next_spans = [span for line in next_block["lines"] for span in line["spans"]]
                        item_text = self.build_line_with_links(next_block, link_map)
                        md_lines.append(f"- {item_text.strip()}")
                        i += 1
                        continue
                    else:
                        i += 1
                        continue

                is_indented = block_x > base_x + 10

                block_lines = []
                for line in block["lines"]:
                    line_text = self.build_span_with_links(line["spans"], link_map)
                    if line_text.strip():
                        block_lines.append(line_text.strip())

                if block_lines:
                    joined = "\n".join(block_lines)
                    if is_indented:
                        for bl in block_lines:
                            md_lines.append(f"- {bl}")
                    else:
                        md_lines.append(joined)
                    md_lines.append("")

                i += 1

        result = "\n".join(md_lines).strip()
        result = self.clean_markdown(result)
        return result


    def build_span_with_links(self, spans, link_map):
        line_text = ""
        for span in spans:
            span_text = span["text"]
            span_rect = tuple(span["bbox"])
            matched_url = self.find_url(span_rect, link_map)
            if matched_url and span_text.strip():
                line_text += f"[{span_text}]({matched_url})"
            else:
                line_text += span_text
        return line_text


    def build_line_with_links(self, block, link_map):
        parts = []
        for line in block["lines"]:
            parts.append(self.build_span_with_links(line["spans"], link_map))
        return " ".join(parts)


    def find_url(self, span_rect, link_map):
        sx0, sy0, sx1, sy1 = span_rect
        for link_rect, url in link_map.items():
            lx0, ly0, lx1, ly1 = link_rect
            if sx0 < lx1 and sx1 > lx0 and sy0 < ly1 and sy1 > ly0:
                return url
        return None


    def clean_markdown(self, text):
        text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)\s*\2', r'[\1](\2)', text)
        text = re.sub(r'\[\s*\]\([^)]+\)\s*', '', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text


    def _read_docx(self, path: Path) -> str:
        doc = docx.Document(path)
        md_lines = []

        for para in doc.paragraphs:
            if not para.text.strip():
                md_lines.append("")
                continue

            para_text = ""
            for run in para.runs:
                run_text = run.text

                url = self.get_hyperlink_url(run, doc)
                if url:
                    para_text += f"[{run_text}]({url})"
                else:
                    para_text += run_text

            if para_text.strip():
                md_lines.append(para_text.strip())

        return "\n".join(md_lines).strip()


    def get_hyperlink_url(self, run, doc):
        """Extrahuje URL z runu pokud je součástí hyperlinku."""
        parent = run._r.getparent()
        if parent.tag == qn("w:hyperlink"):
            rId = parent.get(qn("r:id"))
            if rId and rId in doc.part.rels:
                return doc.part.rels[rId].target_ref
        return None
