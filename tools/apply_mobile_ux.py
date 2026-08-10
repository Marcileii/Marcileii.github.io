from pathlib import Path

FILES = {
    "demos/aurora-estetica/index.html": "demo-site demo-aurora",
    "demos/nexo-contabil/index.html": "demo-site demo-nexo",
    "demos/cafe-atelier/index.html": "demo-site demo-cafe",
    "demos/vista-imoveis/index.html": "demo-site demo-vista",
    "demos/atlas/index.html": "demo-site demo-atlas",
    "demos/leadflow/index.html": "demo-leadflow",
}

for filename, body_class in FILES.items():
    path = Path(filename)
    text = path.read_text(encoding="utf-8")

    if "/assets/demo-mobile.css" not in text:
        marker = "</style>"
        if marker not in text:
            raise RuntimeError(f"Nao encontrei </style> em {filename}")
        text = text.replace(
            marker,
            marker + '<link rel="stylesheet" href="/assets/demo-mobile.css?v=1">',
            1,
        )

    if f'<body class="{body_class}">' not in text:
        if "<body>" not in text:
            raise RuntimeError(f"Nao encontrei <body> simples em {filename}")
        text = text.replace("<body>", f'<body class="{body_class}">', 1)

    # Remove uma metrica ficticia antiga do Atlas; o portfolio nao deve sugerir
    # resultado de cliente que nao existe.
    if filename.endswith("demos/atlas/index.html"):
        text = text.replace(
            '<div class="card"><b>+37%</b><span>mais conversões após reposicionamento e nova landing page.</span></div>',
            '<div class="card"><b>Brand + Web</b><span>direção visual, mensagem e landing page construídas como uma experiência única.</span></div>',
        )

    path.write_text(text, encoding="utf-8")
