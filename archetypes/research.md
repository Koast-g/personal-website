---
# A new research paper, made with:  hugo new research/short-name.md
# Put the PDF in static/documents/ under the same short name.
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
subtitle: ""
date: {{ .Date }}
course: ""
coauthors: []        # for example ["Mitch Paiva"]
pdf: "documents/{{ .File.ContentBaseName }}.pdf"
---

The abstract goes here.
