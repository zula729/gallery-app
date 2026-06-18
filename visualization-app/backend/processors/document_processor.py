import re
from pathlib import Path
import docx
from docx.oxml.ns import qn
import fitz  # PyMuPDF
import pdfplumber


class DocumentProcessor:
    """
    Parses complex layout structures out of PDF and Word files.
    
    Extracts underlying visual layout data, drops noise (e.g. tiny header lines),
    and reconstructs document elements back into coherent Markdown text syntax.
    """

    def read_text(self, file_path: Path) -> str:
        """
        Routes an incoming file path to its corresponding format extractor.

        Args:
            file_path (Path): Pathlib location reference to the target file.

        Returns:
            str: Normalized extracted text or empty string if unmapped.
        """
        if file_path.suffix.lower() == '.pdf':
            return self._read_pdf(file_path)
        if file_path.suffix.lower() == '.docx':
            return self._read_docx(file_path)
        return ""

    def _read_pdf_simpl(self, path: Path) -> str:
        """
        Alternative lightweight method to extract flat unstructured raw text.

        Args:
            path (Path): Pathlib location reference to the target PDF.

        Returns:
            str: Flat reconstructed plain text from all combined pages.
        """
        with pdfplumber.open(path) as pdf:
            return "".join(page.extract_text() or "" for page in pdf.pages)
        
    def _read_pdf(self, pdf_path: Path) -> str:
        """
        Parses complex PDF layouts into interactive Markdown structures.

        Extracts layout positions, isolates hyperlinks via bounding-box cross
        referencing, sanitizes text sizes, and converts visual lists into Markdown.

        Args:
            pdf_path (Path): Pathlib destination location of the source document.

        Returns:
            str: Clean sanitized Markdown representation of the PDF text contents.
        """
        doc = fitz.open(pdf_path)
        md_lines = []

        for page in doc:
            link_map = {}
            # Map out interactive links to their physical dimensions on the page canvas
            for link in page.get_links():
                if "uri" in link:
                    link_map[tuple(link["from"])] = link["uri"]

            # Pull a raw layout block dictionary configuration out of PyMuPDF
            blocks = page.get_text("dict")["blocks"]

            # Calculate base document margins by identifying the leftmost text coordinate
            x_positions = [
                block["bbox"][0] for block in blocks
                if block["type"] == 0 and block["lines"]
            ]
            base_x = min(x_positions) if x_positions else 0

            i = 0
            while i < len(blocks):
                block = blocks[i]

                # Type 0 elements represent standard textual data blocks
                if block["type"] != 0:
                    i += 1
                    continue

                # Flatten multi-dimensional lines and text spans down into an accessible list
                all_spans = [span for line in block["lines"] for span in line["spans"]]

                # Filter out microscopic noise text elements like footers or subscripts
                if all_spans and all(span["size"] < 7 for span in all_spans):
                    i += 1
                    continue

                block_x = block["bbox"][0]
                block_text = " ".join(span["text"] for span in all_spans).strip()

                # Evaluate whether the current textual layout element is a standalone list bullet symbol
                is_bullet_symbol = block_text in ("•", "-", "–", "*", "·")

                if is_bullet_symbol:
                    # Look ahead safely to bind trailing data text block to its current isolated bullet point
                    if i + 1 < len(blocks) and blocks[i + 1]["type"] == 0:
                        i += 1
                        next_block = blocks[i]
                        item_text = self.build_line_with_links(next_block, link_map)
                        md_lines.append(f"- {item_text.strip()}")
                        i += 1
                        continue
                    else:
                        i += 1
                        continue

                # Determine if the current section is block indented relative to page margins
                is_indented = block_x > base_x + 10

                block_lines = []
                for line in block["lines"]:
                    line_text = self.build_span_with_links(line["spans"], link_map)
                    if line_text.strip():
                        block_lines.append(line_text.strip())

                if block_lines:
                    joined = "\n".join(block_lines)
                    if is_indented:
                        # Convert indented blocks directly into list subitems
                        for bl in block_lines:
                            md_lines.append(f"- {bl}")
                    else:
                        md_lines.append(joined)
                    md_lines.append("")

                i += 1

        result = "\n".join(md_lines).strip()
        result = self.clean_markdown(result)
        return result

    def build_span_with_links(self, spans: list[dict], link_map: dict[tuple, str]) -> str:
        """
        Converts text elements into explicit Markdown hyperlink strings if matched.

        Args:
            spans (list[dict]): Text segments containing specific coordinate bounding fields.
            link_map (dict[tuple, str]): Precomputed mapping of coordinate boundaries to target URLs.

        Returns:
            str: Text block with valid embedded Markdown links where applicable.
        """
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

    def build_line_with_links(self, block: dict, link_map: dict[tuple, str]) -> str:
        """
        Aggregates text segments across an internal layout block into a single linked text line.

        Args:
            block (dict): Target structure containing lines and nested text sub-arrays.
            link_map (dict[tuple, str]): Map linking coordinates to URL destinations.

        Returns:
            str: Single combined textual string with integrated markdown links.
        """
        parts = []
        for line in block["lines"]:
            parts.append(self.build_span_with_links(line["spans"], link_map))
        return " ".join(parts)

    def find_url(self, span_rect: tuple[float, float, float, float], link_map: dict[tuple, str]) -> str | None:
        """
        Locates matching hyperlinks based on a 2D bounding box intersection check.

        Evaluates whether a text bounding frame collides with or sits inside 
        an interactive hyperlink zone coordinate box.

        Args:
            span_rect (tuple): Coordinates of the text segment (sx0, sy0, sx1, sy1).
            link_map (dict): Coordinates of interactive link boxes mapped to URLs.

        Returns:
            str | None: String URL destination value if an overlap is found, else None.
        """
        sx0, sy0, sx1, sy1 = span_rect
        for link_rect, url in link_map.items():
            lx0, ly0, lx1, ly1 = link_rect
            # Standard Axis-Aligned Bounding Box (AABB) intersection check loop logic
            if sx0 < lx1 and sx1 > lx0 and sy0 < ly1 and sy1 > ly0:
                return url
        return None

    def clean_markdown(self, text: str) -> str:
        """
        Applies cleaning operations over Markdown string structures via regex patterns.

        Cleans up adjacent duplicated link tags, strips out broken empty brackets,
        and normalizes excessive newline breaks to preserve clear typography layout blocks.

        Args:
            text (str): Raw reconstructed markdown text layout content blocks.

        Returns:
            str: Clean text with normalized spacing and deduplicated links.
        """
        # Deduplicate sequential overlapping URL segments: [Name](url) url -> [Name](url)
        text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)\s*\2', r'[\1](\2)', text)
        # Wipe out dead empty markdown hyper-link frameworks
        text = re.sub(r'\[\s*\]\([^)]+\)\s*', '', text)
        # Limit running stacked empty returns down to standard dual spacing bounds
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text

    def _read_docx(self, path: Path) -> str:
        """
        Extracts structural paragraphs and embedded hyperlinks from an OpenXML Word Document.

        Args:
            path (Path): Pathlib coordinate point location mapping out the target DocX asset.

        Returns:
            str: Clean layout text string containing processed markdown details.
        """
        doc = docx.Document(path)
        md_lines = []

        for para in doc.paragraphs:
            if not para.text.strip():
                md_lines.append("")
                continue

            para_text = ""
            for run in para.runs:
                run_text = run.text

                # Probe OpenXML relationship components to extract target hyperlinks
                url = self.get_hyperlink_url(run, doc)
                if url:
                    para_text += f"[{run_text}]({url})"
                else:
                    para_text += run_text

            if para_text.strip():
                md_lines.append(para_text.strip())

        return "\n".join(md_lines).strip()

    def get_hyperlink_url(self, run: docx.text.run.Run, doc: docx.document.Document) -> str | None:
        """
        Extracts the destination URL from a text run if it sits within a hyperlink element.

        Navigates up into the XML tree layout architecture to evaluate if parent nodes match 
        the standard Word processing 'w:hyperlink' namespace tags.

        Args:
            run (Run): Individual text run element to inspect.
            doc (Document): Main initialized parent document container to lookup relation links.

        Returns:
            str | None: Extracted string URL target reference if located, else None.
        """
        parent = run._r.getparent()
        if parent.tag == qn("w:hyperlink"):
            rId = parent.get(qn("r:id"))
            # Query relationship indexes using relation tracking identifier keys
            if rId and rId in doc.part.rels:
                return doc.part.rels[rId].target_ref
        return None