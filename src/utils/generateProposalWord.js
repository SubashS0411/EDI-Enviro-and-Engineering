
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
    SimpleField
} from "docx";
import { saveAs } from "file-saver";
import { clientScopeData } from './clientScopeData';
import { staticDesignBasis, staticGuarantees, theoryContent } from './proposalStaticContent';

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
            line: 276 // 1.15 line spacing
        },
        alignment: options.alignment || AlignmentType.LEFT,
        bullet: options.bullet ? { level: 0 } : undefined,
        indent: options.indent
    });
};

const createHeading = (text, level = 1) => {
    const size = level === 1 ? 32 : (level === 2 ? 28 : 24); // 16pt, 14pt, 12pt
    return new Paragraph({
        children: [createText(text, { bold: true, size, color: "006400" })],
        spacing: { before: 240, after: 120 },
        alignment: AlignmentType.LEFT,
        heading: level === 1 ? "Heading1" : (level === 2 ? "Heading2" : "Heading3")
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
            guarantees = {},
            daf = {},
            dafPolyDosing = {},
            dafPolyDosingCalc = {},
            dafCoagulantDosing = {},
            dafCoagulantDosingCalc = {},
            anaerobicTank = {},
            anaerobicFeedPump = {},
            biomassPump = {},
            biomassHoldingTank = {},
            biogasHolder = {},
            biogasFlare = {},
            aerationTank = {},
            airBlower = {},
            sludgeCalculationDetails = {},
            mgfSpecs = {},
            mgfCalculations = {},
            acfSpecs = {},
            acfCalculations = {},
            performanceResults = {},
            equipment = [],
            importantConsiderationsPoints = [],
            dosingSystems = {},
            dosingBreakdowns = {},
            screens = {},
            preAcid = {},
            primaryClarifier = {},
            primaryClarifierMech = {},
            primarySludgePump = {},
            secondaryClarifierTank = {},
            secondaryClarifierMech = {},
            sludgeRecircPump = {},
            treatedWaterTank = {},
            treatedWaterPump = {},
            coolingSystem = {},
            instruments = [],
            proposalDetails = {},
            sludgeSystem = {},
            biogasCivil = {},
            standPipe = {},
            aerators = {},
            diffusers = {}
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
                                                createParagraph("EDI Enviro and Engineering", { textOptions: { bold: true, size: 24, color: "006400" } })
                                            ]
                                        })
                                    ],
                                    width: { size: 60, type: WidthType.PERCENTAGE },
                                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
                                }),
                                new TableCell({
                                    children: [
                                        createParagraph(safeString(clientInfo.clientName), { alignment: AlignmentType.RIGHT, textOptions: { size: 16, color: "555555" }, spacingAfter: 0 }),
                                        createParagraph(safeString(clientInfo.address), { alignment: AlignmentType.RIGHT, textOptions: { size: 14, color: "555555" }, spacingAfter: 0 }),
                                        createParagraph(`Ref: ${safeString(clientInfo.referenceNumber)}`, { alignment: AlignmentType.RIGHT, textOptions: { size: 14, color: "555555" } })
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
                        createText("Reg. Office: 93/1B, Sadayampattu (Vill), Somandargudi (PO), Kallakurichi (TK&DT) - 606202 | Page ", { size: 14, color: "888888" }),
                        new SimpleField("PAGE"),
                        createText(" of ", { size: 14, color: "888888" }),
                        new SimpleField("NUMPAGES")
                    ],
                    alignment: AlignmentType.CENTER,
                    border: { top: { color: "CCCCCC", space: 1, style: BorderStyle.SINGLE, size: 6 } }
                })
            ]
        });


        // ==========================================
        // PAGE 1-2: COVER PAGE
        // ==========================================

        sections.push(
            new Paragraph({ text: "", spacing: { before: 2000 } }),
            createParagraph("TECHNICAL PROPOSAL", { textOptions: { bold: true, size: 48, color: "006400" }, alignment: AlignmentType.CENTER }),
            createParagraph("FOR", { textOptions: { size: 24 }, alignment: AlignmentType.CENTER }),
            createParagraph(clientInfo.proposalTitle || "WASTEWATER TREATMENT PLANT", { textOptions: { bold: true, size: 36, color: "006400" }, alignment: AlignmentType.CENTER, spacingAfter: 800 }),
            new Paragraph({ text: "", spacing: { before: 1500 } }),
            createParagraph("PREPARED FOR:", { textOptions: { bold: true, size: 24, color: "555555" }, alignment: AlignmentType.CENTER }),
            createParagraph(clientInfo.clientName || "Client Name", { textOptions: { bold: true, size: 32 }, alignment: AlignmentType.CENTER }),
            createParagraph(clientInfo.address || "Address", { textOptions: { size: 24 }, alignment: AlignmentType.CENTER }),
            new Paragraph({ text: "", spacing: { before: 1500 } }),
            createParagraph(`Date: ${new Date().toLocaleDateString()}`, { alignment: AlignmentType.CENTER }),
            createParagraph(`Reference: ${safeString(clientInfo.referenceNumber)}`, { alignment: AlignmentType.CENTER }),
            new Paragraph({ text: "", spacing: { before: 2000 } }),
            createParagraph("PROPRIETARY & CONFIDENTIAL", { textOptions: { size: 20, color: "888888", italics: true }, alignment: AlignmentType.CENTER }),
            createParagraph("This document contains proprietary information of EDI Enviro and Engineering. It is submitted in confidence and shall not be disclosed, used, or duplicated in whole or in part for any purpose other than to evaluate this proposal.", { textOptions: { size: 16, color: "888888", italics: true }, alignment: AlignmentType.CENTER }),
            new PageBreak()
        );

        // ==========================================
        // PAGE 3: TABLE OF CONTENTS
        // ==========================================

        sections.push(
            createHeading("Table of Contents"),
            createParagraph("1. Client Details & Design Basis"),
            createParagraph("2. Influent Parameters & Technology"),
            createParagraph("3. Process Impact Analysis"),
            createParagraph("4. Process Equipment Specifications"),
            createParagraph("5. Exclusions"),
            new PageBreak()
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
                    ["Date", new Date().toLocaleDateString()]
                ],
                [40, 60]
            ),
            new PageBreak()
        );

        // ==========================================
        // SECTION 2: INFLUENT PARAMETERS & TECHNOLOGY
        // ==========================================

        sections.push(
            createHeading("2. Influent Parameters"),
            createSimpleTable(
                ["Parameter", "Unit", "Inlet Water Characteristics (DAF Feed)", "Anaerobic Feed Water Characteristics"],
                params.map(p => {
                    const anaP = anaerobicFeedParams.find(ap => ap.id === p.id);
                    return [
                        safeString(p.name),
                        safeString(p.unit),
                        safeString(p.value),
                        safeString(anaP ? anaP.value : '')
                    ];
                }),
                [25, 15, 30, 30]
            ),
            createParagraph("Notes:", { spacingBefore: 240, textOptions: { bold: true } }),
            ...staticDesignBasis.notes.map((note, i) => createParagraph(`${i + 1}. ${note}`, { spacingBefore: 60 })),
            new Paragraph({ text: "", spacing: { before: 240 } }),

            createHeading("2.2 Technology Overview", 2),
            createHeading("Pre-Treatment (Screens & DAF)", 3),
            createParagraph("Raw effluent passes through fine screens to remove coarse solids, followed by Dissolved Air Flotation (DAF) to float and remove suspended solids, oils, and grease."),

            createHeading("Anaerobic Treatment (ELAR)", 3),
            createParagraph("The conditioned effluent enters the High-Rate Anaerobic Reactor (ELAR). Granular sludge degrades organic matter (COD/BOD) in the absence of oxygen, producing biogas and treated water."),

            createHeading("Aerobic Treatment (Extended Aeration)", 3),
            createParagraph("Post-anaerobic effluent flows to the Aeration Tank. Surface aerators/diffusers provide oxygen for bacteria to degrade residual organics. The mixed liquor is then separated in a Secondary Clarifier."),

            createHeading("Tertiary Treatment", 3),
            createParagraph("Clarified water is filtered through a Multigrade Filter (MGF) and Activated Carbon Filter (ACF) to remove traces of solids, color, and odor."),

            createHeading("2.3 Process Description", 2),
            createParagraph("DAF: Removes suspended solids and protects downstream biology."),
            createParagraph("Pre-Acidification: Conditions wastewater pH and VFA levels (<40% acidification) to prevent scaling."),
            createParagraph("ELAR: Main biological degradation stage with 3-phase separation."),
            createParagraph("Biogas: Collected in a gas holder; excess is flared."),
            createParagraph("Aeration: Polishing stage for final BOD reduction."),
            createParagraph("Clarification: Solids separation with Sludge Recirculation (RAS)."),
            createParagraph("Sludge Handling: Dewatering via Screw Press."),

            new PageBreak(),

            createHeading("2.4 Performance Guarantees", 2),

            createHeading("Anaerobic Section", 3),
            createSimpleTable(
                ["Parameter", "Guaranteed Value"],
                staticGuarantees.anaerobic.map(p => [safeString(p.param), safeString(p.unit)]),
                [50, 50]
            ),

            createHeading("Aerobic Section (Secondary Clarifier Outlet)", 3),
            createSimpleTable(
                ["Parameter", "Guaranteed Value"],
                staticGuarantees.aerobic.map(p => [safeString(p.param), safeString(p.unit)]),
                [50, 50]
            ),
            new PageBreak()
        );

        // ==========================================
        // SECTION 3: PROCESS IMPACT ANALYSIS
        // ==========================================

        sections.push(
            createHeading("3. Process Impact Analysis"),

            createHeading(theoryContent.bromide.title, 2),
            createParagraph(theoryContent.bromide.text),
            createSimpleTable(
                ["Compound", "Effect", "Notes"],
                theoryContent.bromide.table.map(row => [row.compound, row.effect, row.notes]),
                [30, 30, 40]
            ),

            createHeading(theoryContent.heavyMetals.title, 2),
            createSimpleTable(
                ["Metal", "Role", "Toxic Limit", "Comments"],
                theoryContent.heavyMetals.table.map(row => [row.metal, row.role, row.role, row.comments]), // Mapping 'role' to 'toxic limit' temporarily as simplified in prompt
                [20, 30, 20, 30]
            ),

            createHeading(theoryContent.vfa.title, 2),
            createParagraph(theoryContent.vfa.text),
            new PageBreak()
        );

        // ==========================================
        // SECTION 4: PROCESS EQUIPMENT SPECIFICATIONS (MERGED)
        // ==========================================

        sections.push(createHeading("4. Process Equipment Specifications"));

        // Helper to Create Equipment Section with Scope
        const createEquipSection = (number, title, scope, details, tableHeaders, tableData) => {
            const scopeLabel = scope ? ` [Scope: ${scope}]` : "";
            sections.push(createHeading(`${number} ${title}${scopeLabel}`, 2));

            if (details) {
                // details can be a string or array of strings
                if (Array.isArray(details)) {
                    details.forEach(d => sections.push(createParagraph(d)));
                } else {
                    sections.push(createParagraph(details));
                }
            }

            if (tableData && tableData.length > 0) {
                sections.push(createSimpleTable(tableHeaders, tableData, tableHeaders.map(() => 100 / tableHeaders.length)));
            }
        };

        // 4.1 DAF [Client Scope]
        createEquipSection("4.1", "Dissolved Air Flotation (DAF)", "Client / Existing", null,
            ["Parameter", "Specification"],
            [
                ["DAF Unit", `250 m³/hr, Epoxy Coated MS (Qty: 1)`],
                ["HP Pump", `64 m³/hr @ 10m, CI/SS304 (Qty: 2, 1W+1S)`],
                ["Air Compressor", `12 CFM @ 6 kg/cm², SS304 (Qty: 2, 1W+1S)`]
            ]
        );

        // 4.2 Chemical Dosing Systems [EDI Supply] - Combined
        sections.push(createHeading("4.2 Chemical Dosing Systems [Scope: EDI Supply]", 2));

        const renderDosingTable = (systemName, items) => {
            sections.push(createHeading(systemName, 3));
            const rows = items.map(item => [item.item, item.spec, item.qty]);
            sections.push(createSimpleTable(["Item", "Specification", "Qty"], rows, [30, 50, 20]));
        };

        renderDosingTable("Urea Dosing System", [
            { item: "Dosing Pump", spec: "110 LPH, PP", qty: "2 (1W+1S)" },
            { item: "Dosing Tank", spec: "500 / 2500 Lit, PP/HDPE", qty: "1" },
            { item: "Agitator", spec: "Turbine, SS316", qty: "1" }
        ]);

        renderDosingTable("Phosphoric Acid (H3PO4) Dosing System", [
            { item: "Dosing Pump", spec: "25 LPH, PP", qty: "2 (1W+1S)" },
            { item: "Dosing Tank", spec: "500 Lit, PP/HDPE", qty: "1" }
        ]);

        renderDosingTable("Caustic Dosing System", [
            { item: "Dosing Pump", spec: "100 LPH, SS316", qty: "2 (1W+1S)" },
            { item: "Dosing Tank", spec: "500 / 1000 Lit, MS", qty: "1" },
            { item: "Agitator", spec: "Turbine, SS316", qty: "1" }
        ]);

        renderDosingTable("Micronutrients & HCl Dosing", [
            { item: "Dosing Pump", spec: "10 LPH, PP", qty: "2 (1W+1S)" },
            { item: "Dosing Tank", spec: "500 Lit", qty: "1" }
        ]);


        // 4.3 Screening System [EDI]
        createEquipSection("4.3", "Screening System", "EDI", null,
            ["Parameter", "Specification"],
            [
                ["Type", `Fine Screen`],
                ["MOC", `SS304`],
                ["Quantity", `1 No.`]
            ]
        );

        // 4.4 Pre-Acidification Tank [Client]
        createEquipSection("4.4", "Pre-Acidification Tank", "Client / Existing", null,
            ["Parameter", "Specification"],
            [
                ["Tank Capacity", `300 m³, RCC (Existing Equalization Tank)`],
                ["Agitator", `Slow speed top mounted, SS316 (Make: Ceecons/Verito)`]
            ]
        );

        // 4.5 Anaerobic Feed Pump [EDI]
        createEquipSection("4.5", "Anaerobic Feed Pump", "EDI", null,
            ["Parameter", "Specification"],
            [
                ["Capacity", `225 m³/hr @ 3 kg/cm²`],
                ["Type", `Centrifugal Semi-open, SS304`],
                ["Make", "KSB / Johnson / EQT"],
                ["Quantity", `2 Nos (1W+1S)`]
            ]
        );

        // 4.6 Anaerobic Reactor System [Client/EDI]
        createEquipSection("4.6", "Anaerobic Reactor System", "Client (Civil) / EDI (Internals)", null,
            ["Parameter", "Specification"],
            [
                ["Tank Dimensions", "Dia 9m x 24m Ht"],
                ["Capacity", "1527 m³"],
                ["MOC", "MSEP (Site Fabrication)"],
                ["Quantity", "1 No."]
            ]
        );

        // 4.7 Biomass Transfer Pump [EDI]
        createEquipSection("4.7", "Biomass Transfer Pump", "EDI", null,
            ["Parameter", "Specification"],
            [
                ["Capacity", "10 m³/hr @ 3 kg/cm²"],
                ["Type", "Positive Displacement, Nitrile Stator"],
                ["Quantity", "2 Nos (1W+1S)"]
            ]
        );

        // 4.8 Biogas Handling System [Combined]
        sections.push(createHeading("4.8 Biogas Handling System", 2));
        createHeading("Biogas Holder [Scope: Client (Civil) / EDI (Mech)]", 3);
        sections.push(createSimpleTable(
            ["Parameter", "Specification"],
            [
                ["Dome Dimensions", "Dia 4.5m x 3.5m Ht (Capacity: 56 m³)"],
                ["Outer Tank (Civil)", "Dia 5.5m x 4.5m Ht, RCC"],
                ["MOC (Dome)", "MSEP"]
            ],
            [50, 50]
        ));
        createHeading("Biogas Flare Stack [Scope: EDI]", 3);
        sections.push(createSimpleTable(
            ["Parameter", "Specification"],
            [
                ["Capacity", "700 Nm³/hr"],
                ["Height", "10 m"],
                ["Type", "Open Flare"]
            ],
            [50, 50]
        ));

        // 4.9 Biomass Holding Tank [Client]
        createEquipSection("4.9", "Biomass Holding Tank", "Client", null,
            ["Parameter", "Specification"],
            [
                ["Dimensions", "10m x 5m x 4m"],
                ["Capacity", "200 m³, RCC"]
            ]
        );

        // 4.10 Aeration Tank System [Client]
        createEquipSection("4.10", "Aeration Tank System", "Client", null,
            ["Parameter", "Specification"],
            [
                ["Existing Tank", "1000 m³, RCC"],
                ["Proposed Tank", "4298 m³ (27m x 20m x 4m)"],
                ["Quantity", "2 Nos (Proposed)"]
            ]
        );

        // 4.11 Aeration System Components [EDI]
        createEquipSection("4.11", "Aeration System Components", "EDI", null,
            ["Parameter", "Specification"],
            [
                ["Aerators", "Gear Mounted, SS316"],
                ["Power", "~30 kW x 10 Nos"],
                ["Air Blowers", "Tri-lobe, CI, 2 Nos"]
            ]
        );

        // 4.12 Secondary Clarifier System [Combined]
        sections.push(createHeading("4.12 Secondary Clarifier System", 2));
        createHeading("Clarifier Tanks [Scope: Client]", 3);
        sections.push(createSimpleTable(
            ["Parameter", "Specification"],
            [
                ["Existing Tank", "Dia 12m x 3.5m Ht (390 m³)"],
                ["Proposed Tank", "Dia 17.6m x 3.0m Ht (732 m³)"]
            ],
            [50, 50]
        ));
        createHeading("Clarifier Mechanisms [Scope: EDI]", 3);
        sections.push(createSimpleTable(
            ["Parameter", "Specification"],
            [
                ["Type", "Central Driven, MSEP"],
                ["Quantity", "2 Nos"],
                ["Features", "Scum Collection System included"]
            ],
            [50, 50]
        ));


        // 4.13 Sludge Recirculation Pump [EDI]
        createEquipSection("4.13", "Sludge Recirculation (RAS) Pump", "EDI", null,
            ["Parameter", "Specification"],
            [
                ["Capacity", "200 m³/hr @ 1 kg/cm²"],
                ["Type", "Centrifugal, SS316"],
                ["Quantity", "2 Nos (1W+1S)"]
            ]
        );

        // 4.14 Sludge Management System [EDI]
        sections.push(createHeading("4.14 Sludge Management System [Scope: EDI]", 2));
        createHeading("Sludge Dewatering (Screw Press) [Scope: EDI]", 3);
        sections.push(createSimpleTable(
            ["Parameter", "Specification"],
            [
                ["Capacity", "500 kg dry solids/hr"],
                ["MOC", "SS316"],
                ["Make", "SNP / Chemiescience / EQT"]
            ],
            [50, 50]
        ));
        createHeading("Poly Dosing System", 3);
        sections.push(createSimpleTable(
            ["Parameter", "Specification"],
            [
                ["Poly Prep/Dosing Tanks", "10 m³ each, RCC (Client Scope)"],
                ["Dosing Pump", "3 m³/hr, Screw type, 2 Nos (1W+1S) (EDI Scope)"],
                ["Feed Pump", "22 m³/hr, Screw type, 2 Nos (1W+1S) (EDI Scope)"]
            ],
            [50, 50]
        ));

        // 4.15 Treated Water Handling [Client/EDI]
        createEquipSection("4.15", "Treated Water Handling", "Client/EDI", null,
            ["Parameter", "Specification"],
            [
                ["Treated Water Tank", "300 m³, RCC [Scope: Client]"],
                ["Transfer Pump", "250 m³/hr, SS316, 2 Nos [Scope: EDI]"]
            ]
        );

        // 4.16 Other Major Equipment [EDI]
        createEquipSection("4.16", "Other Major Equipment", "EDI", null,
            ["Equipment", "Specification"],
            [
                ["Tertiary Filters", "MGF + ACF, MS Epoxy"],
                ["Instruments", "Flow, Level, pH, Temp transmitters (E&H preferred)"]
            ]
        );

        // 4.17 Piping & Valves [EDI/Client]
        sections.push(createHeading("4.17 Piping & Valves Specifications", 2));
        sections.push(createSimpleTable(
            ["Service Line", "Material (MOC)", "Type / Class"],
            [
                ["Raw Effluent", "UPVC / HDPE", "Sch 80 / PE100"],
                ["Anaerobic Feed", "SS 304 / HDPE", "Sch 10 / PE100"],
                ["Biogas Line", "SS 304 / HDPE", "Sch 10 / PN6"],
                ["Air Line (Blower to Tank)", "MS 'B' Class / SS 304", "Heavy Duty"],
                ["Air Grid (Inside Tank)", "UPVC / ABS", "High Pressure"],
                ["Sludge Line", "UPVC / HDPE", "Sch 80"],
                ["Chemical Dosing", "UPVC / Braided Hose", "Chemical Resistant"],
                ["Treated Water", "UPVC", "Sch 40"]
            ],
            [40, 30, 30]
        ));

        sections.push(new PageBreak());

        // ==========================================
        // SECTION 5: EXCLUSIONS
        // ==========================================

        sections.push(
            createHeading("5. Exclusions from Scope of Supply"),
            createParagraph("The following items are excluded from our scope of supply and shall be arranged by the client:"),

            createParagraph("• Civil Works: All foundations, RCC tanks, buildings, roads, and drains.", { spacingBefore: 60, indent: { left: 720 } }),
            createParagraph("• Power Supply: Incoming power, cabling to panel, transformers.", { spacingBefore: 60, indent: { left: 720 } }),
            createParagraph("• Water & Utilities: Service water and compressed air supply.", { spacingBefore: 60, indent: { left: 720 } }),
            createParagraph("• Manpower: Operating and maintenance staff.", { spacingBefore: 60, indent: { left: 720 } }),
            createParagraph("• Chemicals: Lab chemicals and bulk chemicals.", { spacingBefore: 60, indent: { left: 720 } }),
            createParagraph("• Statutory Approvals: Pollution Control Board clearances.", { spacingBefore: 60, indent: { left: 720 } }),
            createParagraph("• Mill Constraints: Oxidizing biocides prohibited; Fresh water intake restricted to 800 m³/day.", { spacingBefore: 60, indent: { left: 720 } })
        );

        // --- Final Document Assembly ---
        const doc = new Document({
            sections: [{
                properties: {},
                headers: { default: headerElement },
                footers: { default: footerElement },
                children: sections,
            }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `Technical_Proposal_${safeString(clientInfo.clientName).replace(/[^a-z0-9]/gi, '_')}.docx`);

    } catch (error) {
        console.error("Error generating Word document:", error);
        throw error;
    }
};
