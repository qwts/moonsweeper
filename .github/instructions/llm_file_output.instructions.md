---
applyTo: "**/*.md"
description: "Rules for generating and retrieving primary files and metadata sidecars for optimized LLM context management."
---

# LLM Instruction: Structured File Output & Metadata Sidecars

**Core Directive:**
When generating or modifying files, you must produce two distinct outputs: the **Primary Data File** and a **Metadata Sidecar (.meta.json)**. When reading files, you must use the sidecar to retrieve only the necessary chunks, avoiding loading the entire document into context.

## 1. Primary File Formatting
* **Line Padded Indexing:** Prefix every line with a 6-digit padded line number followed by a pipe and a space (e.g., `000001 | `).
* **Block Anchors:** Surround logical sections (functions, structs, classes) with unique hex-encoded comment tags using the language's native comment syntax. 
  * Example: `// <anchor:0xAF12>` ... `// </anchor:0xAF12>`
* **Chunking Limits:** Do not output more than 50 lines of code without inserting a structural break or a summary comment anchor.

## 2. Sidecar Metadata (.meta.json)
For every file created or modified, generate a companion JSON file named `<filename>.meta.json` with the following structure:
* `filename`: The exact name of the primary file.
* `file_stats`: An object containing `total_lines` and `byte_size`.
* `blocks`: An array of objects mapping the primary file. Each object must contain:
  * `id`: The hex anchor matching the primary file (e.g., "0xAF12").
  * `label`: A concise description of the section's purpose.
  * `lines`: An array containing the start and end lines `[start_line, end_line]`.
  * `dependencies`: Any internal or external references found in that block.
  * `query_hints`: An array of 3-5 keywords per section to assist vector search and retrieval.

## 3. Execution Order: Writing
1. **Analyze:** Determine the total scope and structural boundaries of the required data.
2. **Write Sidecar:** Generate the `.meta.json` sidecar first to map the output.
3. **Write Primary File:** Output the primary file using the strict 6-digit line prefixing.
4. **Validate:** Verify that the start and end line numbers in the sidecar exactly match the final output of the primary file.

## 4. Execution Order: Reading & Retrieval
When asked to analyze, query, or modify an existing file that utilizes this structure, you must follow these steps:
1. **Check for Sidecar:** Before attempting to read the primary file, check if a `<filename>.meta.json` exists in the same directory.
2. **Parse Metadata:** Read the JSON sidecar to locate the specific `id` (anchor) or line range (`lines`) that corresponds to the target `label` or `query_hints`.
3. **Targeted Extraction:** Do NOT read the entire primary file into context. Use targeted terminal commands or file-read tools to extract only the identified block.
  * *By Line Range:* Use `sed` (e.g., `sed -n '100,150p' filename`).
  * *By Anchor:* Use `grep` or `awk` to extract text between the specific hex anchors.
4. **Context Conservation:** If multiple separate blocks are needed, extract and analyze them individually.