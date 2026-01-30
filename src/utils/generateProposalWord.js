
import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
    BorderStyle,
    AlignmentType,
    Header,
    Footer,
    PageBreak,
    ImageRun,
    VerticalAlign,
    PageNumber,
    HeadingLevel
} from "docx";
import { saveAs } from "file-saver";
import { clientScopeData } from './clientScopeData';
import {
    staticDesignBasis,
    technologyOverview,
    processDescription,
    performanceGuarantees,
    theoryContent,
    exclusionsList,
    exclusionsConclusion
} from './proposalStaticContent';

// --- Helpers for Safe Text Handling ---

const safeString = (val) => {
    if (val === null || val === undefined || val === '') return "";
    return String(val);
};

// --- Basic Formatting Helpers (Word 2010 Compatible) ---

const createText = (text, options = {}) => {
    return new TextRun({
        text: safeString(text),
        font: "Calibri",
        size: options.size || 22, // 11pt default
        bold: options.bold || false,
        italics: options.italics || false,
        color: options.color || "000000",
    });
};

const createParagraph = (textOrRuns, options = {}) => {
    const children = Array.isArray(textOrRuns)
        ? textOrRuns
        : [createText(textOrRuns, options.textOptions)];

    return new Paragraph({
        children: children,
        spacing: {
            before: options.spacingBefore || 120,
            after: options.spacingAfter || 120,
            line: 360 // 1.5 line spacing for better readability
        },
        alignment: options.alignment || AlignmentType.JUSTIFIED, // Justified text
        bullet: options.bullet ? { level: 0 } : undefined,
        indent: options.indent
    });
};

const createHeading = (text, level = 1) => {
    // Increased sizes: Level 1=36(18pt), Level 2=32(16pt), Level 3=28(14pt)
    const size = level === 1 ? 36 : (level === 2 ? 32 : 28);
    return new Paragraph({
        children: [createText(text, { bold: true, size, color: "2E74B5" })], // Blue color (2E74B5 is a standard professional blue)
        spacing: { before: 240, after: 120 },
        alignment: AlignmentType.LEFT,
        heading: level === 1 ? HeadingLevel.HEADING_1 : (level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3)
    });
};

// --- Table Helpers (Simple Structure) ---

const createCell = (content, options = {}) => {
    return new TableCell({
        children: [
            createParagraph(content, {
                textOptions: options.textOptions,
                alignment: options.alignment || AlignmentType.LEFT
            })
        ],
        width: options.width ? { size: options.width, type: WidthType.PERCENTAGE } : undefined,
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 100, bottom: 100, left: 100, right: 100 }
    });
};

const createSimpleTable = (headers, data, widths = []) => {
    const rows = [];

    // Header Row
    if (headers && headers.length > 0) {
        rows.push(
            new TableRow({
                children: headers.map((h, i) =>
                    createCell(h, {
                        textOptions: { bold: true },
                        alignment: AlignmentType.CENTER,
                        width: widths[i]
                    })
                ),
                tableHeader: true
            })
        );
    }

    // Data Rows
    data.forEach(rowData => {
        rows.push(
            new TableRow({
                children: rowData.map((cellData, i) =>
                    createCell(cellData, { width: widths[i] })
                )
            })
        );
    });

    return new Table({
        rows: rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        }
    });
};

// --- Main Generator Function ---

export const generateProposalWord = async (data) => {
    try {
        const {
            clientInfo = {},
            params = [],
            anaerobicFeedParams = [],
            // Equipment Data & Standard Inputs
            primaryClarifier = {},
            primaryClarifierMech = {},
            primarySludgePump = {}, // Fallback if needed
            coolingSystem = {},
            preAcid = {}, // existing pre-acid tank
            anaerobicFeedPump = {},
            anaerobicTank = {}, // Reactor System
            biomassPump = {},
            biogasHolder = {},
            biogasFlare = {},
            biomassHoldingTank = {},
            aerationTank = {},
            airBlower = {}, // Aeration Comps
            aerators = {}, // Aeration Comps
            secondaryClarifierTank = {},
            secondaryClarifierMech = {},
            sludgeRecircPump = {},
            sludgeSystem = {}, // Dewatering
            treatedWaterTank = {},
            treatedWaterPump = {},
            tertiarySpecs = {}, // MGF/ACF
            mgfSpecs,
            mgfCalculations,
            acfSpecs,
            acfCalculations,
            sludgeCalculationDetails,
            instruments = [],
            pipingSpecs = {},
            valveSpecs = {},
            // Checklist Selections
            techOverview = [],
            processDesc = [],
            selectedSections = []
        } = data || {};

        const sections = [];

        // --- Fetch Logo Image ---
        let imageBuffer = null;
        try {
            const response = await fetch('/logo.png');
            if (response.ok) {
                const blob = await response.blob();
                imageBuffer = await blob.arrayBuffer();
            }
        } catch (e) {
            console.warn("Failed to fetch logo for Word document", e);
        }

        const headerElement = new Header({
            children: [
                new Table({
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: imageBuffer ? [
                                                new ImageRun({
                                                    data: imageBuffer,
                                                    transformation: { width: 150, height: 50 },
                                                })
                                            ] : [
                                                createText("EDI Enviro and Engineering", { bold: true, size: 24, color: "006400" })
                                            ]
                                        })
                                    ],
                                    width: { size: 60, type: WidthType.PERCENTAGE },
                                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                }),
                                new TableCell({
                                    children: [
                                        createParagraph(safeString(clientInfo.clientName), { alignment: AlignmentType.RIGHT, textOptions: { size: 16, color: "555555" }, spacingAfter: 0 }),
                                        createParagraph(`Ref: ${safeString(clientInfo.referenceNumber)}`, { alignment: AlignmentType.RIGHT, textOptions: { size: 14, color: "555555" }, spacingAfter: 0 }),
                                        createParagraph(`Date: ${new Date().toLocaleDateString()}`, { alignment: AlignmentType.RIGHT, textOptions: { size: 14, color: "555555" } })
                                    ],
                                    width: { size: 40, type: WidthType.PERCENTAGE },
                                    verticalAlign: VerticalAlign.TOP,
                                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                })
                            ]
                        })
                    ],
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" } }
                })
            ]
        });

        const footerElement = new Footer({
            children: [
                new Paragraph({
                    children: [
                        createText("EDI Enviro & Engineering | Page ", { size: 14, color: "888888" }),
                        new TextRun({
                            children: [PageNumber.CURRENT]
                        }),
                        createText(" of ", { size: 14, color: "888888" }),
                        new TextRun({
                            children: [PageNumber.TOTAL_PAGES]
                        })
                    ],
                    alignment: AlignmentType.CENTER,
                    border: { top: { color: "CCCCCC", space: 1, style: BorderStyle.SINGLE, size: 6 } }
                })
            ]
        });


        // ==========================================
        // PAGE 1: COVER PAGE
        // ==========================================

        sections.push(
            new Paragraph({ text: "", spacing: { before: 2000 } }),
            createParagraph("TECHNICAL PROPOSAL", { textOptions: { bold: true, size: 48, color: "006400" }, alignment: AlignmentType.CENTER }),
            createParagraph("FOR", { textOptions: { size: 24 }, alignment: AlignmentType.CENTER }),
            createParagraph(clientInfo.proposalTitle || "WASTEWATER TREATMENT PLANT", { textOptions: { bold: true, size: 36, color: "006400" }, alignment: AlignmentType.CENTER, spacingAfter: 800 }),
            new Paragraph({ text: "", spacing: { before: 1500 } }),
            createParagraph(`Client: ${safeString(clientInfo.clientName)}`, { textOptions: { bold: true, size: 28 }, alignment: AlignmentType.CENTER }),
            createParagraph(`Reference: ${safeString(clientInfo.referenceNumber)}`, { textOptions: { size: 24 }, alignment: AlignmentType.CENTER }),
            createParagraph(`Date: ${new Date().toLocaleDateString()}`, { textOptions: { size: 24 }, alignment: AlignmentType.CENTER }),
            new Paragraph({
                children: [new PageBreak()]
            }),

            // ==========================================
            // PAGE 2: TABLE OF CONTENTS (Static)
            // ==========================================

            createHeading("Table of Contents"),

            // Static TOC - All section titles with page numbers
            createSimpleTable(
                ["Section", "Title", "Page"],
                [
                    ["1", "Client Details & Design Basis", "3"],
                    ["2", "Influent Parameters", "4"],
                    ["  2.1", "Technology Overview", "5"],
                    ["  2.2", "Process Description", "5"],
                    ["  2.3", "Performance Guarantees", "6"],
                    ["3", "Process Impact Analysis", "7"],
                    ["  3.1", "Impact of Bromide", "7"],
                    ["  3.2", "Impact of Heavy Metals", "8"],
                    ["  3.3", "Impact of Higher VFA", "8"],
                    ["4", "Process Equipment Specifications", "9"],
                    ["  4.1", "Dissolved Air Flotation (DAF) [Scope: EDI]", "9"],
                    ["  4.2", "Chemical Dosing Systems", "10"],
                    ["  4.3", "Screening System [Scope: EDI]", "12"],
                    ["  4.4", "Primary Clarification System [Scope: Client]", "12"],
                    ["  4.5", "Cooling System (PHE) [Scope: EDI]", "13"],
                    ["  4.6", "Pre-acidification Tank [Scope: Client]", "13"],
                    ["  4.7", "Anaerobic Feed Pump [Scope: EDI]", "14"],
                    ["  4.8", "Anaerobic Reactor System", "14"],
                    ["  4.9", "Biomass Transfer Pump [Scope: EDI]", "15"],
                    ["  4.10", "Biogas Handling System", "15"],
                    ["  4.11", "Biomass Holding Tank [Scope: EDI]", "16"],
                    ["  4.12", "Start-up Granular Biomass", "16"],
                    ["  4.13", "Aeration Tank System [Scope: Client]", "17"],
                    ["  4.14", "Aeration System Components", "17"],
                    ["  4.15", "Secondary Clarifier System", "18"],
                    ["  4.16", "Sludge Recirculation Pump [Scope: EDI]", "18"],
                    ["  4.17", "Sludge Management System [Scope: EDI]", "19"],
                    ["  4.18", "Treated Water Handling", "19"],
                    ["  4.19", "Other Major Equipment", "20"],
                    ["  4.20", "Pipings", "21"],
                    ["  4.21", "Valves", "21"],
                    ["5", "Exclusions from Scope of Supply & Services", "22"]
                ],
                [10, 75, 15]
            ),
            new Paragraph({ children: [new PageBreak()] })
        );

        // ==========================================
        // SECTION 1: CLIENT DETAILS & DESIGN BASIS
        // ==========================================

        sections.push(
            createHeading("1. Client Details & Design Basis"),
            createSimpleTable(
                ["Parameter", "Value"],
                [
                    ["Client Name", safeString(clientInfo.clientName)],
                    ["Industry", safeString(clientInfo.industry)],
                    ["Production Capacity", `${safeString(clientInfo.productionCapacity)} TPD`],
                    ["Specific COD", `${safeString(clientInfo.specificCOD)} kg/ton`],
                    ["Calculated COD Load", `${safeString(clientInfo.calcCODLoad)} kg/day`],
                    ["Raw Material", safeString(clientInfo.rawMaterial) || "-"],
                    ["Final Products", safeString(clientInfo.finalProducts) || "-"],
                    ["Date", new Date().toLocaleDateString()]
                ],
                [40, 60]
            ),
            new Paragraph({ children: [new PageBreak()] })
        );

        // ==========================================
        // SECTION 2: INFLUENT PARAMETERS
        // ==========================================

        sections.push(
            createHeading("2. Influent Parameters"),
            createSimpleTable(
                ["Parameter", "Unit", "Inlet Water Characteristics", "Anaerobic Feed Water Characteristics"],
                staticDesignBasis.parameters.map(p => {
                    const userParam = params.find(up => (up.name === p.param) || (up.id === p.sn)); // Best effort match
                    const userAnaParam = anaerobicFeedParams.find(up => (up.name === p.param) || (up.id === p.sn));
                    return [
                        safeString(p.param),
                        safeString(p.unit),
                        safeString(userParam ? userParam.value : p.raw),
                        safeString(userAnaParam ? userAnaParam.value : p.anaInlet)
                    ];
                }),
                [25, 15, 30, 30]
            ),
            createParagraph("Notes:", { spacingBefore: 240, textOptions: { bold: true } }),
            ...staticDesignBasis.notes.map((note, i) => createParagraph(`${i + 1}. ${note}`, { spacingBefore: 60 })),
            new Paragraph({ text: "", spacing: { before: 240 } }),

            // 2.1 Technology Overview
            createHeading(technologyOverview.title, 2),
            ...technologyOverview.sections
                .filter(sec => techOverview.includes(sec.title)) // Filter by selection
                .flatMap(sec => [
                    createParagraph(sec.title, { textOptions: { bold: true, size: 26 } }),
                    ...(sec.intro ? [createParagraph(sec.intro)] : []),
                    ...(sec.subsections ? sec.subsections.flatMap(sub => [
                        createParagraph(sub.heading + ":", { textOptions: { bold: true, size: 24 } }),
                        ...(sub.text ? [createParagraph(sub.text, { indent: { left: 360 } })] : []),
                        ...(sub.bullets ? sub.bullets.map(b => createParagraph(`• ${b}`, { indent: { left: 360 } })) : [])
                    ]) : []),
                    // Fallback for old bullets format
                    ...(sec.bullets ? sec.bullets.map(b => createParagraph(`• ${b.title}: ${b.text}`, { indent: { left: 360 } })) : [])
                ]),
            new Paragraph({ text: "", spacing: { before: 240 } }),

            // 2.3 Process Description
            createHeading(processDescription.title, 2),
            ...processDescription.items
                .filter(item => processDesc.includes(item.title)) // Filter by selection
                .map(item =>
                    createParagraph(`• ${item.title}: ${item.text}`, { indent: { left: 360 } })
                ),
            new Paragraph({ text: "", spacing: { before: 240 } }),

            // 2.4 Performance Guarantees
            createHeading(performanceGuarantees.title, 2),

            ...(selectedSections.includes('Anaerobic Section') ? [
                createHeading(performanceGuarantees.anaerobic.title, 3),
                createSimpleTable(
                    performanceGuarantees.anaerobic.headers,
                    performanceGuarantees.anaerobic.data.map(d => [d.param, d.val]),
                    [50, 50]
                ),
                new Paragraph({ text: "", spacing: { before: 240 } })
            ] : []),

            ...(selectedSections.includes('Aerobic Section') ? [
                createHeading(performanceGuarantees.aerobic.title, 3),
                createSimpleTable(
                    performanceGuarantees.aerobic.headers,
                    performanceGuarantees.aerobic.data.map(d => [d.param, d.val]),
                    [50, 50]
                )
            ] : []),

            // Important Considerations
            new Paragraph({ text: "", spacing: { before: 240 } }),
            createParagraph(performanceGuarantees.importantConsiderations.title, { textOptions: { bold: true, size: 26 } }),
            ...performanceGuarantees.importantConsiderations.bullets.map(b =>
                createParagraph(`• ${b}`, { indent: { left: 360 } })
            ),
            new Paragraph({ children: [new PageBreak()] })
        );

        // ==========================================
        // SECTION 3: PROCESS IMPACT ANALYSIS
        // ==========================================

        sections.push(
            createHeading(theoryContent.title),

            // 3.1 Bromide
            createHeading(theoryContent.bromide.title, 2),
            createParagraph(theoryContent.bromide.intro),
            createSimpleTable(
                theoryContent.bromide.headers,
                theoryContent.bromide.table.map(r => [r.compound, r.effect, r.notes]),
                [30, 30, 40]
            ),
            new Paragraph({ text: "", spacing: { before: 240 } }),

            // 3.2 Heavy Metals
            createHeading(theoryContent.heavyMetals.title, 2),
            createSimpleTable(
                theoryContent.heavyMetals.headers,
                theoryContent.heavyMetals.table.map(r => [r.metal, r.role, r.beneficial, r.toxic, r.comments]),
                [20, 20, 20, 20, 20]
            ),
            new Paragraph({ text: "", spacing: { before: 240 } }),

            // 3.3 Higher VFA
            createHeading(theoryContent.vfa.title, 2),
            createParagraph(theoryContent.vfa.text),
            createParagraph(theoryContent.vfa.equation, { alignment: AlignmentType.CENTER, textOptions: { bold: true, size: 24 } }),
            new Paragraph({ text: "", spacing: { before: 120 } }),
            createParagraph(theoryContent.vfa.consequencesTitle, { textOptions: { bold: true } }),
            ...theoryContent.vfa.consequences.map(b => createParagraph(`• ${b}`, { indent: { left: 360 } })),
            new Paragraph({ text: "", spacing: { before: 120 } }),
            createParagraph(theoryContent.vfa.controlMeasure, { textOptions: { bold: true } }),
            new Paragraph({ children: [new PageBreak()] })
        );

        // ==========================================
        // SECTION 4: PROCESS EQUIPMENT SPECIFICATIONS
        // ==========================================

        sections.push(createHeading("4. Process Equipment Specifications"));

        // Helper
        const createEquipSection = (number, title, scope, details, tableHeaders, tableData) => {
            const scopeLabel = scope ? ` [Scope: ${scope}]` : "";
            sections.push(createHeading(`${number} ${title}${scopeLabel}`, 2));
            if (details) {
                if (Array.isArray(details)) details.forEach(d => sections.push(createParagraph(d)));
                else sections.push(createParagraph(details));
            }
            if (tableData && tableData.length > 0) {
                sections.push(createSimpleTable(tableHeaders, tableData, tableHeaders.map(() => 100 / tableHeaders.length)));
            }
        };

        // 4.1 DAF [Scope: EDI]
        createEquipSection("4.1", "Dissolved Air Flotation (DAF)", "EDI", null,
            ["Parameter", "Specification"],
            [
                ["Flow Rate", safeString(clientInfo.designFlow || "250 m3/hr")],
                ["Make", "Krofta / DAFTech / Ishan / Kpack"],
                ["Inlet / Outlet TSS", `${safeString(params.find(p => p.name === 'TSS')?.value || "4000")} / <300 mg/l`],
                ["Quantity", "1 No."]
            ]
        );

        // 4.2 Chemical Dosing Systems - Detailed Format
        sections.push(createHeading("4.2 Chemical Dosing Systems", 2));

        const renderDosingDetailed = (systemName, calcData, pumpData, tankData, agitatorData) => {
            // Header
            sections.push(createHeading(systemName, 3)); // e.g. "Phosphoric Acid Dosing System"

            // Calculations Table (if data provided)
            if (calcData) {
                sections.push(createParagraph("Calculations:", { textOptions: { bold: true, size: 22 } }));
                const calcRows = Object.entries(calcData).map(([k, v]) => [k, v]);
                sections.push(createSimpleTable(null, calcRows, [50, 50]));
                sections.push(new Paragraph({ text: "", spacing: { before: 120 } }));
            }

            // A) Dosing Pump Table
            sections.push(createParagraph("A) Dosing Pump [Scope: EDI]", { textOptions: { bold: true, size: 22 } }));
            sections.push(createSimpleTable(
                null, // No Header row
                [
                    ["Capacity", pumpData.capacity, "Make", pumpData.make],
                    ["Type", pumpData.type, "MOC", pumpData.moc],
                    ["Quantity", pumpData.qty, "-", "-"]
                ],
                [25, 25, 25, 25]
            ));
            sections.push(new Paragraph({ text: "", spacing: { before: 120 } }));

            // B) Dosing Tank Table
            if (tankData) {
                sections.push(createParagraph("B) Dosing Tank [Scope: EDI]", { textOptions: { bold: true, size: 22 } }));
                sections.push(createSimpleTable(
                    null,
                    [
                        ["Capacity", tankData.capacity, "Type", tankData.type],
                        ["MOC", tankData.moc, "Make", tankData.make],
                        ["Quantity", tankData.qty, "-", "-"]
                    ],
                    [25, 25, 25, 25]
                ));
                sections.push(new Paragraph({ text: "", spacing: { before: 120 } }));
            }

            // C) Agitator Table
            if (agitatorData) {
                sections.push(createParagraph("C) Agitator [Scope: EDI]", { textOptions: { bold: true, size: 22 } }));
                sections.push(createSimpleTable(
                    null,
                    [
                        ["RPM", agitatorData.rpm || "80-90", "Make", agitatorData.make],
                        ["Type", agitatorData.type, "MOC", agitatorData.moc],
                        ["Quantity", agitatorData.qty, "-", "-"]
                    ],
                    [25, 25, 25, 25]
                ));
                sections.push(new Paragraph({ text: "", spacing: { before: 120 } }));
            }
        };

        // Urea
        renderDosingDetailed("Urea Dosing System",
            { "N Required": "Calculated Value", "Dosing Tank": "2500 Lit", "Dosing Pump": "110 LPH" },
            { capacity: "110 LPH", make: "Miltonroy / Prominent / EQT", type: "Diaphragm", moc: "PP", qty: "2 (1W+1S)" },
            { capacity: "2500 Lit", type: "Vertical", moc: "HDPE", make: "Sintex/EQT", qty: "1" },
            { rpm: "80-90", make: "Ceecons/Verito/EQT", type: "Turbine", moc: "SS316", qty: "1" }
        );

        // Phosphoric Acid
        renderDosingDetailed("Phosphoric Acid Dosing System",
            { "P Required": "Calculated Value", "Dosing Tank": "500 Lit", "Dosing Pump": "25 LPH" },
            { capacity: "25 LPH", make: "Miltonroy / Prominent / EQT", type: "Diaphragm", moc: "PP", qty: "2 (1W+1S)" },
            { capacity: "500 Lit", type: "Vertical", moc: "HDPE", make: "Sintex/EQT", qty: "1" },
            null // No agitator typically for acid
        );

        // Caustic
        renderDosingDetailed("Caustic Dosing System",
            null, // No calcs shown
            { capacity: "100 LPH", make: "Miltonroy / Prominent / EQT", type: "Diaphragm", moc: "SS316", qty: "2 (1W+1S)" },
            { capacity: "1000 Lit", type: "Vertical", moc: "MS", make: "Site Fabrication", qty: "1" },
            { rpm: "80-90", make: "Ceecons/Verito/EQT", type: "Turbine", moc: "SS316", qty: "1" }
        );

        // HCl
        renderDosingDetailed("HCl Dosing System",
            null,
            { capacity: "10 LPH", make: "Miltonroy / Prominent / EQT", type: "Diaphragm", moc: "PP", qty: "2 (1W+1S)" },
            { capacity: "500 Lit", type: "Vertical", moc: "MSRL", make: "Site Fabrication", qty: "1" },
            null
        );

        // Micronutrients
        renderDosingDetailed("Micronutrients Dosing System",
            null,
            { capacity: "10 LPH", make: "Miltonroy / Prominent / EQT", type: "Diaphragm", moc: "PP", qty: "2 (1W+1S)" },
            { capacity: "500 Lit", type: "Vertical", moc: "HDPE", make: "Sintex/EQT", qty: "1" },
            { rpm: "80-90", make: "Ceecons/Verito/EQT", type: "Turbine", moc: "SS316", qty: "1" }
        );


        // 4.3 Screening System [Scope: EDI]
        createEquipSection("4.3", "Screening System", "EDI", null,
            ["Parameter", "Specification"],
            [
                ["Type", "Fine Screen"],
                ["Capacity", safeString(clientInfo.designFlow || "250 m3/hr")],
                ["MOC", "SS304"],
                ["Pore Size", "2mm"]
            ]
        );

        // 4.4 Primary Clarification [Scope: Client] - NEW
        createEquipSection("4.4", "Primary Clarification System", "Client", null,
            ["Parameter", "Specification"],
            [
                ["Tank MOC", "RCC (Concrete)"],
                ["Mechanism", "Central Driven, MSEP (Make: Indofab/EQT)"],
                ["Sludge Pump", "Centrifugal, Make: KSB/Abirami/Johnson"]
            ]
        );

        // 4.5 Cooling System [Scope: EDI] - NEW
        createEquipSection("4.5", "Cooling System (PHE)", "EDI", null,
            ["Parameter", "Specification"],
            [
                ["Capacity", safeString(clientInfo.designFlow || "250 m3/hr")],
                ["MOC", "SS304"],
                ["Temp Out", "35°C"],
                ["Quantity", "2 Nos (1W+1S)"]
            ]
        );

        // 4.6 Pre-acidification Tank [Scope: Client] - (Relevant for Anaerobic)
        if (selectedSections.includes('Anaerobic Section')) {
            createEquipSection("4.6", "Pre-acidification Tank", "Client", null,
                ["Parameter", "Specification"],
                [
                    ["Capacity", `${safeString(preAcid.capacity || "300 m3")}, RCC`],
                    ["Agitator", "Submersible / Top Mounted, SS316 (Make: Sulzer/Ceecons/EQT)"]
                ]
            );

            // 4.7 Anaerobic Feed Pump [Scope: EDI]
            createEquipSection("4.7", "Anaerobic Feed Pump", "EDI", null,
                ["Parameter", "Specification"],
                [
                    ["Capacity", safeString(anaerobicFeedPump.capacity || "225 m3/hr")],
                    ["Type", "Centrifugal Semi-open"],
                    ["MOC", "CI / SS304"],
                    ["Make", "KSB / Kirloskar / Johnson"],
                    ["Quantity", "2 Nos (1W+1S)"]
                ]
            );

            // 4.8 Anaerobic Reactor System
            createEquipSection("4.8", "Anaerobic Reactor System", null, null,
                ["Parameter", "Specification"],
                [
                    ["Capacity", safeString(anaerobicTank.capacity || "1527 m3")],
                    ["Type", "Vertical, MSEP (Site Fabrication)"],
                    ["Stand Pipe", "MSEP"]
                ]
            );

            // 4.9 Biomass Transfer Pump [Scope: EDI]
            createEquipSection("4.9", "Biomass Transfer Pump", "EDI", null,
                ["Parameter", "Specification"],
                [
                    ["Capacity", safeString(biomassPump.capacity || "10 m3/hr")],
                    ["Type", "Positive Displacement (Screw), Nitrile Stator"],
                    ["Make", "Netzsch / Hydroprokav / EQT"]
                ]
            );

            // 4.10 Biogas Handling System
            createEquipSection("4.10", "Biogas Handling System", null, null,
                ["Parameter", "Specification"],
                [
                    ["Biogas Holder", "Floating Dome type, MSEP Dome / RCC Tank"],
                    ["Flare Stack", `${safeString(biogasFlare.capacity || "700")} Nm3/hr, 10m Height, Open Flare`],
                    ["Accessories", "Flame Arrestor, Pilot/Main SOV, Moisture Separator"]
                ]
            );

            // 4.11 Biomass Holding Tank [Scope: EDI]
            createEquipSection("4.11", "Biomass Holding Tank", "EDI", null,
                ["Parameter", "Specification"],
                [
                    ["Capacity", safeString(biomassHoldingTank.capacity || "200 m3")],
                    ["MOC", "MSEP"],
                    ["Shape", "Rectangular"]
                ]
            );

            // 4.12 Start-up Granular Biomass
            sections.push(createHeading("4.12 Start-up Granular Biomass", 2));
            sections.push(createParagraph("Start-up granular biomass during commissioning stage."));
            const vssCapacity = Math.round((Number(anaerobicTank.capacity?.split(' ')[0] || 1500) * 0.5));
            sections.push(createSimpleTable(
                null,
                [
                    ["Calculated Quantity", `${vssCapacity} m³`],
                    ["Requirement", "60 kg VSS (VSS/TSS ratio >60%)"]
                ],
                [40, 60]
            ));
        }

        // 4.13 Aeration Tank System [Scope: Client]
        if (selectedSections.includes('Aerobic Section')) {
            sections.push(createHeading("4.13 Aeration Tank System [Scope: Client]", 2));

            // A) Capacity Design
            sections.push(createParagraph("A) Capacity Design", { textOptions: { bold: true } }));
            sections.push(createSimpleTable(
                null,
                [
                    ["Anaerobic Inlet BOD", "2500 mg/l", "Anaerobic Removal", "80%"],
                    ["Anaerobic Outlet BOD", "500.00 mg/l", "BOD Load to Aeration", "1717.75 kg/day"],
                    ["F/M Ratio", "0.15", "MLSS", "3500 mg/l"],
                    ["Calculated Capacity", `${safeString(aerationTank.capacity || "3271.90 m³")}`, "-", "-"]
                ],
                [25, 25, 25, 25]
            ));
            sections.push(new Paragraph({ text: "", spacing: { before: 120 } }));

            // B) Dimensions & Details
            sections.push(createParagraph("B) Dimensions & Details", { textOptions: { bold: true } }));
            sections.push(createSimpleTable(
                null,
                [
                    ["Shape", "Rectangular", "Dimensions", "40.45m (L) x 20.22m (W) x 4m (H)"],
                    ["HRT", "11.43 hours", "MOC", "RCC"],
                    ["Quantity", "1", "Type", "Extended Aeration"]
                ],
                [20, 30, 20, 30]
            ));

            // 4.14 Aeration System Components
            sections.push(createHeading("4.14 Aeration System Components", 2));

            // A) Surface Aerators
            sections.push(createParagraph("A) Surface Aerators [Scope: EDI]", { textOptions: { bold: true } }));
            sections.push(createSimpleTable(
                null,
                [
                    ["Motor HP", "5 HP", "Make", "Indofab"],
                    ["Type", "Surface aerator", "Quantity", "9"]
                ],
                [25, 25, 25, 25]
            ));
            sections.push(new Paragraph({ text: "", spacing: { before: 120 } }));

            // B) Air Blowers
            sections.push(createParagraph("B) Air Blowers [Scope: EDI]", { textOptions: { bold: true } }));
            sections.push(createSimpleTable(
                null,
                [
                    ["Total Air Req", "17177.50 Nm³/day", "Air Flow", "715.73 Nm³/hr"],
                    ["Head", "5000 mWC", "Make", "KPT"],
                    ["Type", "Tri lobe", "Quantity", "2 (1W+1S)"]
                ],
                [25, 25, 25, 25]
            ));

            // 4.15 Secondary Clarifier System
            createEquipSection("4.15", "Secondary Clarifier System", null, null,
                ["Parameter", "Specification"],
                [
                    ["Tank", `${safeString(secondaryClarifierTank.dimensions || "Dia 17.6m")}, RCC [Scope: Client]`],
                    ["Mechanism", "Central Driven, MSEP [Scope: EDI]"]
                ]
            );

            // 4.16 Sludge Recirculation Pump [Scope: EDI]
            createEquipSection("4.16", "Sludge Recirculation Pump", "EDI", null,
                ["Parameter", "Specification"],
                [
                    ["Capacity", safeString(sludgeRecircPump.capacity || "200 m3/hr")],
                    ["Type", "Centrifugal Semi-open, CI"],
                    ["Quantity", "2 Nos (1W+1S)"]
                ]
            );
        }

        // 4.17 Sludge Management System [Scope: EDI]
        sections.push(createHeading("4.17 Sludge Management System", 2));

        const sludgeSpecs = sludgeCalculationDetails || {};
        const sludgeRows = [
            ["Dewatering Mechanism", sludgeSpecs.dewateringMechanism || (sludgeSpecs.screwPressRequired ? "Screw Press" : "Decanter Centrifuge")],
            ["Capacity", `${sludgeSpecs.dewateringCapacityTons || 0} Tons/day Solids`],
            ["Processing Rate", `${sludgeSpecs.dewateringProcessingCapacityKgHr || 0} kg/hr`],
            ["Polymer Dosing System", "Auto Dosing System"],
            ["Dosing Tank", `${sludgeSpecs.dosingTankSpecs?.qty || 1} No. x ${sludgeSpecs.dosingTankSpecs?.capacity || 500} Lit`],
            ["Dosing Pump", `${sludgeSpecs.dosingPumpSpecs?.qty || '2 Nos'} x ${sludgeSpecs.dosingPumpSpecs?.capacity || 50} LPH`]
        ];

        sections.push(createSimpleTable(
            ["Parameter", "Specification"],
            sludgeRows,
            [50, 50]
        ));

        // 4.18 Treated Water Handling
        createEquipSection("4.18", "Treated Water Handling", null, null,
            ["Parameter", "Specification"],
            [
                ["Tank", `${safeString(treatedWaterTank.capacity || "300 m3")}, RCC [Scope: Client]`],
                ["Transfer Pump", `Centrifugal, ${safeString(treatedWaterPump.capacity || "250 m3/hr")}, CI [Scope: EDI]`]
            ]
        );

        // 4.19 Other Major Equipment
        sections.push(createHeading("4.19 Other Major Equipment", 2));
        sections.push(createSimpleTable(
            ["Equipment Name", "Specifications", "Scope"],
            [
                ["Sludge Dewatering", "Screw Press / Centrifuge", "EDI"],
                ["Tertiary Filters", "MGF + ACF, MS Epoxy", "EDI"]
            ],
            [35, 45, 20]
        ));

        // 4.20 Instrumentation
        if (instruments && instruments.length > 0) {
            sections.push(createHeading("4.20 Instrumentation", 2));
            const instrumentRows = instruments.map(inst => {
                const parts = inst.split(' - ');
                return [parts[0] || inst, parts[1] || '-', parts[2] || '-']; // Name, Location, Range/Type
            });

            sections.push(createSimpleTable(
                ["Instrument", "Location", "Range / Type"],
                instrumentRows,
                [30, 40, 30]
            ));
        }

        // 4.21 Pipings (Skip 4.20)
        sections.push(createHeading("4.21 Pipings", 2));
        sections.push(createSimpleTable(
            ["Service Line", "Material (MOC)"],
            [
                ["Conditioning to ELAR", "HDPE"],
                ["Biogas Line", "SS304"],
                ["ELAR to Aeration", "HDPE"],
                ["Chemical Dosing", "PP / PVC / SS304"],
                ["Service Water", "MS"]
            ],
            [50, 50]
        ));

        // 4.22 Valves
        sections.push(createHeading("4.22 Valves", 2));
        sections.push(createSimpleTable(
            ["Valve Type", "MOC"],
            [
                ["Ball Valve", "PP or CI/SS316"],
                ["Butterfly Valve", "CI/SS316"],
                ["Knife Edge Gate Valve", "CI/SS316"]
            ],
            [50, 50]
        ));

        sections.push(new Paragraph({ children: [new PageBreak()] }));

        // ==========================================
        // SECTION 5: EXCLUSIONS
        // ==========================================

        sections.push(createHeading("5. Exclusions from Scope of Supply & Services"));
        sections.push(createParagraph("Unless specifically mentioned in the scope of supply, the following items and activities are excluded from this proposal and shall be in the Client's scope:"));

        exclusionsList.forEach((exc, i) => {
            sections.push(createParagraph(`${i + 1}. ${exc.title}: ${exc.desc}`, { spacingBefore: 60, indent: { left: 360 } }));
        });

        if (exclusionsConclusion) {
            sections.push(new Paragraph({ text: "", spacing: { before: 240 } }));
            sections.push(createParagraph(exclusionsConclusion, { alignment: AlignmentType.JUSTIFIED }));
        }


        // --- Final Document Assembly ---
        const doc = new Document({
            features: {
                updateFields: true,
            },
            sections: [{
                properties: {},
                headers: { default: headerElement },
                footers: { default: footerElement },
                children: sections,
            }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Technical_Proposal_${safeString(clientInfo.clientName || "Draft")}.docx`);

    } catch (error) {
        console.error("Error generating Word document:", error);
        throw error;
    }
};
