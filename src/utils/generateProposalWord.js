
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
    if (val === null || val === undefined) return "-";
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
            biomassPump = {}, // Added
            biomassHoldingTank = {}, // Added
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
            preAcid = {}, // Added missing destructuring
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
                                                    transformation: {
                                                        width: 150,
                                                        height: 50,
                                                    },
                                                })
                                            ] : [
                                                // Fallback if image fails
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
            createParagraph("1. Design Details"),
            createParagraph("2. Technology Overview"),
            createParagraph("3. EDI Scope of Supply"),
            createParagraph("4. Client Scope of Supply"),
            createParagraph("5. Battery Limit"),
            createParagraph("6. Exclusions"),
            new PageBreak()
        );

        // ==========================================
        // THEORETICAL BACKGROUND (Before Section 1)
        // ==========================================

        // a) Impact of Bromide
        sections.push(
            createHeading(theoryContent.bromide.title),
            createParagraph(theoryContent.bromide.text),
            createSimpleTable(
                ["Compound", "Effect on Anaerobes", "Notes"],
                theoryContent.bromide.table.map(row => [row.compound, row.effect, row.notes]),
                [30, 30, 40]
            ),
            new PageBreak()
        );

        // b) Impact of Heavy Metals
        sections.push(
            createHeading(theoryContent.heavyMetals.title),
            createSimpleTable(
                ["Metal", "Role (at trace level)", "Typical Range (mg/L)", "Toxic Range (mg/L)", "Comments"],
                theoryContent.heavyMetals.table.map(row => [row.metal, row.role, row.range, row.toxic, row.comments]),
                [15, 25, 15, 15, 30]
            ),
            new PageBreak()
        );

        // c) Impact of Higher VFA
        sections.push(
            createHeading(theoryContent.vfa.title),
            createParagraph(theoryContent.vfa.text),
            new PageBreak()
        );

        // ==========================================
        // SECTION 1: DESIGN DETAILS (Static Base)
        // ==========================================

        sections.push(
            createHeading("1. Design Details"),
            createHeading("1.1 Design Basis", 2),
            createParagraph(staticDesignBasis.intro),
            createSimpleTable(
                ["S. No", "Parameter", "Unit", "DAF Feed", "At Anaerobic Inlet"],
                staticDesignBasis.parameters.map(p => [
                    safeString(p.sn),
                    safeString(p.param),
                    safeString(p.unit),
                    safeString(p.raw),
                    safeString(p.anaInlet)
                ]),
                [10, 30, 15, 20, 25]
            ),
            createParagraph("Note:", { spacingBefore: 240, textOptions: { bold: true } }),
            ...staticDesignBasis.notes.map((note, i) =>
                createParagraph(`${i + 1}. ${note}`, { spacingBefore: 60 })
            ),
            createParagraph(""),

            createHeading("1.2 Guarantee Parameters", 2),
            createHeading("Anaerobic Outlet", 3),
            createSimpleTable(
                ["S. No", "Parameter", "Unit / Value"],
                staticGuarantees.anaerobic.map(p => [safeString(p.sn), safeString(p.param), safeString(p.unit)]),
                [10, 40, 50]
            ),
            createHeading("Secondary Outlet", 3),
            createSimpleTable(
                ["S. No", "Parameter", "Unit / Value"],
                staticGuarantees.secondary.map(p => [safeString(p.sn), safeString(p.param), safeString(p.unit)]),
                [10, 40, 50]
            ),
            createParagraph("Notes:", { spacingBefore: 240, textOptions: { bold: true } }),
            ...staticGuarantees.notes.map((note, i) =>
                createParagraph(`${i + 1}. ${note}`, { spacingBefore: 60 })
            ),
            new PageBreak()
        );

        // ==========================================
        // SECTION 2: TECHNOLOGY OVERVIEW
        // ==========================================

        sections.push(
            createHeading("2. Technology Overview"),

            // 2.1 Technology Overview (Detailed)
            createHeading("2.1 Technology Description", 2),

            createHeading("ELAR (Elevated Anaerobic Reactor)", 3),
            createParagraph("Working Principle: The ELAR is a high-rate anaerobic system designed for industrial wastewater. It utilizes a granular sludge blanket to degrade organic matter, producing biogas as a valuable byproduct."),
            createParagraph("Key Features & Advantages:", { textOptions: { bold: true } }),
            createParagraph("• Compact design with small footprint"),
            createParagraph("• High organic loading capacity"),
            createParagraph("• Flexible biomass retention"),
            createParagraph("• Efficient energy recovery (biogas)"),
            createParagraph("Applications: Suitable for high COD wastewaters including paper mills, starch, distilleries, and food processing industries."),

            createHeading("Aerobic Tank", 3),
            createParagraph("The aerobic tank serves as a post-anaerobic treatment stage to polish the effluent. It utilizes activated sludge process where microorganisms degrade remaining organics in the presence of oxygen."),
            createParagraph("Key Parameters & Mechanism:", { textOptions: { bold: true } }),
            createParagraph("• Calcium precipitation mechanism integration for scaling control"),
            createParagraph("• MLSS Range: 5,000 - 10,000 mg/L for high stability"),
            createParagraph("• MLVSS: 40 - 50% indicating active biomass"),
            createParagraph("• High efficiency oxygen transfer system for energy savings"),
            createParagraph("• Robust biological reduction of residual COD and BOD"),

            createHeading("Secondary Clarifier", 3),
            createParagraph("Designed for effective solid-liquid separation after the aerobic stage. It ensures high-quality effluent and proper sludge recirculation."),
            createParagraph("Specifications & Operation:", { textOptions: { bold: true } }),
            createParagraph("• Optimized Hydraulic Loading Rate (HLR) for clear separation"),
            createParagraph("• Controlled Solids Loading Rate (SLR) to handle biomass flux"),
            createParagraph("• Efficient Return Activated Sludge (RAS) system to maintain MLSS"),
            createParagraph("• Waste Activated Sludge (WAS) management for excess biomass removal"),
            createParagraph("• Ensures final effluent meets discharge or recycle quality norms"),

            // 2.2 Process Description
            createHeading("2.2 Process Description", 2),
            createParagraph("The process integrates physical, chemical, and biological stages for COD removal and energy recovery."),

            createParagraph("DAF (Dissolved Air Flotation):", { textOptions: { bold: true } }),
            createParagraph("The Dissolved Air Flotation (DAF) unit removes suspended solids and fats/oils/grease (FOG) from the raw effluent using micro-bubbles. This pre-treatment step protects downstream biological systems from inert solids accumulation and shock loads."),

            createParagraph("Pre-Acidification Tank:", { textOptions: { bold: true } }),
            createParagraph("This tank conditions the wastewater, adjusting pH and ensuring partial acidification (VFA generation) before entering the anaerobic reactor. Degree of acidification is controlled <40% to prevent scaling issues. Includes necessary agitation to maintain homogeneity."),

            createParagraph("ELAR (Anaerobic):", { textOptions: { bold: true } }),
            createParagraph("The main biological treatment stage where organic pollutants are converted into biogas by anaerobic bacteria in a controlled, oxygen-free environment. Features internal three-phase separation (Gas-Liquid-Solid) to retain granular biomass while releasing biogas and treated effluent. Includes sampling points and instrumentation for process monitoring."),

            createParagraph("Biogas Holder & Flare:", { textOptions: { bold: true } }),
            createParagraph("Biogas generated is collected in a constant pressure gas holder. Excess gas is safely burned via an automated flare stack system to prevent atmospheric discharge. System includes safety devices like flame arrestors, pressure relief valves, and condensate traps."),

            createParagraph("Biomass Holding Tank:", { textOptions: { bold: true } }),
            createParagraph("Stores excess granular sludge or biomass for future use or system restart, preserving valuable biological inventory. Essential for quick recovery after shutdowns or upsets."),

            createParagraph("Aeration Tank:", { textOptions: { bold: true } }),
            createParagraph("An oxygen-rich environment where aerobic bacteria further degrade COD/BOD to meet final discharge norms. Equipped with fine bubble or surface aeration systems to provide dissolved oxygen and mixing."),

            createParagraph("Secondary Clarifier:", { textOptions: { bold: true } }),
            createParagraph("Separates biological sludge from treated water by gravity settling. Settled sludge is recycled to the aeration tank (RAS) to maintain MLSS, while clear overflow water is discharged for tertiary treatment or disposal."),

            createParagraph("Sludge Handling:", { textOptions: { bold: true } }),
            createParagraph("Generates excess biological and chemical sludge is dewatered using a screw press or centrifuge to reduce volume before disposal. Includes polymer dosing system for sludge conditioning."),

            new PageBreak()
        );

        // ==========================================
        // SECTION 3: EDI SCOPE OF SUPPLY
        // ==========================================

        // --- 3.1 Equipment List Logic (Comprehensive & Scope Split) ---
        const allEquip = [];
        const pushEquip = (obj, name, defaultSpecs, defaultMoc) => {
            if (obj && obj.required) {
                allEquip.push({
                    name: name,
                    specs: defaultSpecs || `${obj.capacity || ''} ${obj.type || ''}`.trim() || '-',
                    qty: safeString(obj.qty || '1'),
                    moc: safeString(obj.moc || obj.material || defaultMoc || 'Std'),
                    scope: obj.scope || 'EDI'
                });
            }
        };

        // --- Add All Equipment (Synced with PDF Logic) ---
        pushEquip(screens, "Screens", `${screens.capacity} ${screens.type}`, screens.moc);
        pushEquip(preAcid, "Pre-Acidification Tank", `${preAcid.capacity} m³`, preAcid.moc);
        if (daf.required) {
            pushEquip(daf, "DAF Unit", `${daf.flow} m³/hr`, "Epoxy Coated MS");
            // DAF Components
            if (daf.hpPumpCapacity) allEquip.push({ name: "DAF HP Pump", specs: `${daf.hpPumpCapacity} m³/hr`, qty: daf.hpPumpQty, moc: daf.hpPumpMOC, scope: daf.scope });
            if (daf.airCompCapacity) allEquip.push({ name: "DAF Air Compressor", specs: `${daf.airCompCapacity} CFM`, qty: daf.airCompQty, moc: daf.airCompMOC, scope: daf.scope });
        }

        pushEquip(anaerobicFeedPump, "Anaerobic Feed Pump", `${anaerobicFeedPump.capacity} m³/hr`, anaerobicFeedPump.material);
        pushEquip(anaerobicTank, "Anaerobic Reactor", `${anaerobicTank.capacity} m³`, anaerobicTank.moc);
        pushEquip(standPipe, "Stand Pipe", standPipe.capacity, standPipe.moc);
        pushEquip(biomassPump, "Biomass Pump", `${biomassPump.capacity} m³/hr`, biomassPump.moc);

        pushEquip(biogasHolder, "Biogas Holder (Mech)", `${biogasHolder.capacity} m³`, "MSEP/Membrane");
        pushEquip(biogasCivil, "Biogas Holder (Civil)", `${biogasCivil.capacity} m³`, "RCC");
        pushEquip(biogasFlare, "Biogas Flare", `${biogasFlare.capacity} Nm³/hr`, biogasFlare.moc);
        pushEquip(biomassHoldingTank, "Biomass Holding Tank", `${biomassHoldingTank.capacity} m³`, biomassHoldingTank.moc);

        pushEquip(aerationTank, "Aeration Tank", `${aerationTank.capacity} m³`, aerationTank.moc);
        pushEquip(aerators, "Surface Aerators", `${aerators.power} HP`, aerators.moc);
        pushEquip(airBlower, "Air Blower", `${airBlower.capacity} m³/hr`, "CI");
        pushEquip(diffusers, "Diffusers", diffusers.type, diffusers.moc);

        pushEquip(secondaryClarifierTank, "Secondary Clarifier Tank", `${secondaryClarifierTank.proposedDia} m Dia`, secondaryClarifierTank.moc);
        pushEquip(secondaryClarifierMech, "Secondary Clarifier Mech", `${secondaryClarifierMech.capacity} m Dia`, secondaryClarifierMech.moc);
        pushEquip(sludgeRecircPump, "Sludge Recirculation Pump", `${sludgeRecircPump.capacity} m³/hr`, sludgeRecircPump.moc);

        pushEquip(treatedWaterTank, "Treated Water Tank", `${treatedWaterTank.capacity} m³`, treatedWaterTank.moc);
        pushEquip(treatedWaterPump, "Treated Water Pump", `${treatedWaterPump.capacity} m³/hr`, treatedWaterPump.moc);

        // Primary Treatment (Paper)
        pushEquip(primaryClarifier, "Primary Clarifier", `${primaryClarifier.capacity} m³`, primaryClarifier.moc);
        pushEquip(primaryClarifierMech, "Primary Clarifier Mech", primaryClarifierMech.capacity, primaryClarifierMech.moc);
        pushEquip(primarySludgePump, "Primary Sludge Pump", `${primarySludgePump.capacity} m³/hr`, primarySludgePump.moc);
        pushEquip(coolingSystem, "Cooling System", `${coolingSystem.capacity} m³/hr`, coolingSystem.moc);

        // Filters
        pushEquip(mgfSpecs, "Multigrade Filter", `${mgfSpecs.flow} m³/hr`, mgfSpecs.moc);
        pushEquip(acfSpecs, "Activated Carbon Filter", `${acfSpecs.flow} m³/hr`, acfSpecs.moc);

        // Dosing Systems
        if (dosingSystems) {
            Object.entries(dosingSystems).forEach(([k, v]) => {
                if (v.required) {
                    if (v.pump) allEquip.push({ name: `${k} Dosing Pump`, specs: `${v.pump.capacity} LPH`, qty: v.pump.qty || '1', moc: v.pump.moc, scope: v.pump.scope || 'EDI' });
                    if (v.tank) allEquip.push({ name: `${k} Dosing Tank`, specs: `${v.tank.capacity} Lit`, qty: v.tank.qty || '1', moc: v.tank.moc, scope: v.tank.scope || 'EDI' });
                    if (v.agitator) allEquip.push({ name: `${k} Dosing Agitator`, specs: v.agitator.capacity || '-', qty: v.agitator.qty || '1', moc: v.agitator.moc, scope: v.agitator.scope || 'EDI' });
                }
            });
        }

        // Sludge Handling
        pushEquip(sludgeSystem, "Sludge Dewatering System", `${sludgeSystem.totalCapacity} kg/hr`, "Std");


        if (equipment && equipment.length > 0) {
            equipment.forEach(e => pushEquip(e, e.name, e.specs, "-"));
        }

        // --- Filter by Scope ---
        const ediItems = allEquip.filter(e => e.scope === 'EDI');
        const clientItems = allEquip.filter(e => e.scope === 'Client');

        // Render EDI Scope Table
        sections.push(
            createHeading("3. EDI Scope of Supply"),
            createHeading("3.1 Equipment List", 2),
            createSimpleTable(
                ["Equipment Name", "Specifications", "Qty", "MOC"],
                ediItems.length > 0 ? ediItems.map(e => [e.name, e.specs, e.qty, e.moc]) : [["-", "-", "-", "-"]],
                [30, 40, 10, 20]
            ),
            createParagraph(""),

            createHeading("3.2 Piping Specifications", 2),
            createSimpleTable(
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
            ),
            new PageBreak()
        );

        // ==========================================
        // SECTION 4: CLIENT SCOPE OF SUPPLY
        // ==========================================

        sections.push(
            createHeading("4. Client Scope of Supply"),
            createHeading("4.1 Civil & Equipment Scope", 2),
            createSimpleTable(
                ["Equipment Name", "Specifications", "Qty", "MOC"],
                clientItems.length > 0 ? clientItems.map(e => [e.name, e.specs, e.qty, e.moc]) : [["-", "-", "-", "-"]],
                [30, 40, 10, 20]
            ),
            createParagraph("The client shall provide the following:")
        );

        if (clientScopeData && clientScopeData.length > 0) {
            clientScopeData.forEach(scopeItem => {
                sections.push(
                    createHeading(scopeItem.title, 2)
                );

                if (scopeItem.isList) {
                    scopeItem.data.forEach(line => {
                        sections.push(createParagraph(`• ${line}`, { indent: { left: 360 } }));
                    });
                } else {
                    sections.push(
                        createSimpleTable(
                            scopeItem.headers,
                            scopeItem.data,
                            scopeItem.headers.map(() => 100 / scopeItem.headers.length)
                        )
                    );
                }
                sections.push(new Paragraph({ text: "", spacing: { before: 200 } }));
            });
        }
        sections.push(new PageBreak());

        // ==========================================
        // SECTION 5: BATTERY LIMIT (Placeholder)
        // ==========================================

        sections.push(
            createHeading("5. Battery Limit"),
            createParagraph("• Inlet: Raw effluent feed pump discharge at equalization tank."),
            createParagraph("• Outlet: Discharge of treated water transfer pump."),
            createParagraph("• Power: At the incoming breaker of the main control panel."),
            createParagraph("• Water: At the inlet of the chemical preparation tanks."),
            createParagraph("• Sludge: At the discharge chute of the sludge dewatering machine."),
            new PageBreak()
        );

        // ==========================================
        // SECTION 6: EXCLUSIONS
        // ==========================================

        sections.push(
            createHeading("6. Exclusions"),
            createParagraph("The following items are excluded from our scope of supply and shall be arranged by the client:"),

            ...importantConsiderationsPoints.map(point =>
                createParagraph(`• ${safeString(point)}`, { spacingBefore: 60, spacingAfter: 60, indent: { left: 720 } })
            ),

            createParagraph("• Civil works foundation and construction.", { spacingBefore: 60, indent: { left: 720 } }),
            createParagraph("• Incoming power supply and cabling up to the panel.", { spacingBefore: 60, indent: { left: 720 } }),
            createParagraph("• Laboratory equipment and chemicals.", { spacingBefore: 60, indent: { left: 720 } }),
            createParagraph("• Operation and maintenance staff.", { spacingBefore: 60, indent: { left: 720 } }),
            createParagraph("• Land, Approach Road, and Street Lighting.", { spacingBefore: 60, indent: { left: 720 } }),
            createParagraph("• Administrative Building, Lab, and Store.", { spacingBefore: 60, indent: { left: 720 } })
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
