export const staticDesignBasis = {
    intro: "The design basis is based on the paper production of 300 TPD.",
    parameters: [
        { sn: 1, param: "Flow", unit: "m3/day", raw: "6000", anaInlet: "4890" },
        { sn: 2, param: "pH", unit: "-", raw: "6.5 - 7.5", anaInlet: "6.5 - 7.5" },
        { sn: 3, param: "Temperature", unit: "°C", raw: "30 - 38", anaInlet: "30 - 38" },
        { sn: 4, param: "TSS", unit: "mg/l", raw: "4000", anaInlet: "< 300" },
        { sn: 5, param: "VFA", unit: "meq/l", raw: "30", anaInlet: "< 30" },
        { sn: 6, param: "Calcium", unit: "mg/l", raw: "< 600", anaInlet: "< 600" },
        { sn: 7, param: "Sulphate", unit: "mg/l", raw: "< 200", anaInlet: "< 200" },
        { sn: 8, param: "sCOD", unit: "mg/l", raw: "5000", anaInlet: "5000" },
        { sn: 9, param: "BOD", unit: "mg/l", raw: "2500", anaInlet: "2500" },
        { sn: 10, param: "ORP", unit: "mV", raw: "-100 to -150", anaInlet: "-100 to -150" },
        { sn: 11, param: "NH4-N", unit: "mg/l", raw: "0", anaInlet: "0" },
        { sn: 12, param: "PO4-P", unit: "mg/l", raw: "0", anaInlet: "0" },
        { sn: 13, param: "Toxic Elements", unit: "mg/l", raw: "Nil", anaInlet: "Nil" }
    ],
    notes: [
        "Client has to ensure the feed limiting parameters like pH, TSS and temperature are maintaining well within the limit.",
        "Client has to avoid using bromine based biocide in the mill as it is a strong oxidant.",
        "Client has to ensure all the mill chemicals used in the wet end get prior approval from EDI enviro."
    ]
};

export const technologyOverview = {
    title: "2.2 Technology Overview",
    sections: [
        {
            title: "ELAR (Elevated Anaerobic Reactor)",
            bullets: [
                { title: "Working Principle", text: "The ELAR is a high-rate anaerobic system designed for industrial wastewater. It utilizes a granular sludge blanket to degrade organic matter, producing biogas as a valuable by-product." },
                { title: "Key Features", text: "Compact design, High organic loading capacity, Flexible biomass retention, Efficient energy recovery (biogas)." },
                { title: "Applications", text: "Suitable for high COD wastewaters including paper mills, starch, distilleries, and food processing industries." }
            ]
        },
        {
            title: "Aerobic Treatment System",
            bullets: [
                { title: "Process", text: "Utilizes activated sludge process where microorganisms degrade remaining organics in the presence of oxygen. Serves as a post-anaerobic treatment stage to polish the effluent." },
                { title: "Key Parameters", text: "Calcium precipitation mechanism integration; MLSS Range: 5,000-10,000 mg/L; MLVSS: 40-50%." }
            ]
        },
        {
            title: "Secondary Clarification",
            bullets: [
                { title: "Function", text: "Designed for effective solid-liquid separation after the aerobic stage. It ensures high-quality effluent and proper sludge recirculation." },
                { title: "Specifications", text: "Optimized Hydraulic Loading Rate (HLR), Controlled Solids Loading Rate (SLR), Efficient Return Activated Sludge (RAS) system." }
            ]
        }
    ]
};

export const processDescription = {
    title: "2.3 Process Description",
    items: [
        { title: "DAF", text: "Removes suspended solids and fats/oils/grease (FOG) from the raw effluent using micro-bubbles to protect downstream biological systems." },
        { title: "Pre-Acidification", text: "Conditions the wastewater (pH adjustment, partial acidification) before entering the anaerobic reactor. Degree of acidification is controlled (<40%) to prevent scaling." },
        { title: "ELAR", text: "The main biological treatment stage where organic pollutants are converted into biogas. Features internal three-phase separation (Gas-Liquid-Solid)." },
        { title: "Biogas & Flare", text: "Generated biogas is collected in a constant pressure gas holder. Excess gas is safely burned via an automated flare stack system." },
        { title: "Biomass Tank", text: "Stores excess granular sludge for future use or system restart." },
        { title: "Aeration Tank", text: "An oxygen-rich environment where aerobic bacteria further degrade COD/BOD to meet final discharge norms." },
        { title: "Secondary Clarifier", text: "Separates biological sludge from treated water by gravity settling. Settled sludge is recycled (RAS)." },
        { title: "Sludge Handling", text: "Excess biological and chemical sludge is dewatered using a screw press or centrifuge." }
    ]
};

export const performanceGuarantees = {
    title: "2.4 Performance Guarantees",
    anaerobic: {
        title: "Anaerobic Section",
        headers: ["Parameter", "Guaranteed Value"],
        data: [
            { param: "Anaerobic SCOD Removal", val: "80%" },
            { param: "Anaerobic BOD Removal", val: "80%" },
            { param: "Biogas Generation Factor", val: "0.42 Nm3/kg COD removed" }
        ]
    },
    aerobic: {
        title: "Aerobic Section (Secondary Clarifier Outlet)",
        headers: ["Parameter", "Guaranteed Value"],
        data: [
            { param: "Secondary Clarifier Outlet SCOD", val: "~250 mg/l" },
            { param: "Secondary Clarifier Outlet TSS", val: "50 mg/l" },
            { param: "Secondary Clarifier Outlet BOD", val: "30 mg/l" }
        ]
    }
};

export const theoryContent = {
    title: "3. Process Impact Analysis",
    bromide: {
        title: "3.1 Impact of Bromide",
        intro: "Anaerobic microbes (like methanogens, fermenters, sulfate reducers) are sensitive to halogens and oxidizing compounds.",
        headers: ["Compound", "Effect on Anaerobes", "Notes"],
        table: [
            { compound: "Bromide (Br-)", effect: "Generally inert", notes: "Acts as a precursor. Can be oxidized to HOBr." },
            { compound: "Hypobromous acid (HOBr)", effect: "Highly toxic", notes: "Stronger biocide than HOCl at high pH." },
            { compound: "Bromate (BrO3-)", effect: "Inhibitory", notes: "Formed if bromide is oxidized by ozone." },
            { compound: "Organic bromides", effect: "Variable toxicity", notes: "Some can be degraded, others recalcitrant." }
        ]
    },
    heavyMetals: {
        title: "3.2 Impact of Heavy Metals",
        headers: ["Metal", "Role (Trace)", "Beneficial (mg/L)", "Toxic (mg/L)", "Comments"],
        table: [
            { metal: "Zinc (Zn2+)", role: "Essential", beneficial: "0.05 - 2.0", toxic: "> 5 - 10", comments: "High levels precipitate." },
            { metal: "Cobalt (Co2+)", role: "Essential", beneficial: "0.01 - 0.5", toxic: "> 1.0 - 5.0", comments: "Critical for B12." },
            { metal: "Manganese (Mn2+)", role: "Essential", beneficial: "0.05 - 5.0", toxic: "> 10 - 50", comments: "Stabilizes enzymes." },
            { metal: "Copper (Cu2+)", role: "Essential", beneficial: "0.01 - 0.5", toxic: "> 1.0 - 2.0", comments: "Toxic free ion." },
            { metal: "Nickel (Ni2+)", role: "Essential", beneficial: "0.05 - 0.5", toxic: "> 2.0 - 5.0", comments: "Critical for F430." },
            { metal: "Iron (Fe2+/3+)", role: "Macro/Trace", beneficial: "1.0 - 10.0", toxic: "> 50", comments: "Precipitates sulfide." }
        ]
    },
    vfa: {
        title: "3.3 Impact of Higher VFA (Volatile Fatty Acids)",
        text: "In RCF based paper mills, high VFA concentrations dissociate Calcium Carbonate (CaCO3) into Calcium Acetate. Inside the reactor, this degrades back to CaCO3, causing calcium scaling on biomass.",
        bullets: [
            "Consequences: Reduces effective surface area, Increases sludge density, Interferes with mass transfer.",
            "Control Measure: Maintain Pre-acidification degree < 40% to minimize scaling risks."
        ]
    }
};

export const exclusionsList = [
    { title: "Civil Works", desc: "All civil, structural, and allied works including excavation, PCC, RCC, foundations, etc." },
    { title: "Erection, Fabrication & Site Handling", desc: "Mechanical erection, fabrication, and material handling at site." },
    { title: "Storage Shed", desc: "Covered area for equipment and chemical storage." },
    { title: "Start-up Biomass", desc: "Supply and acclimatization of seed sludge." },
    { title: "Dewatered Sludge Handling", desc: "Disposal of sludge or waste solids." },
    { title: "Statutory Clearances", desc: "EC, CTE, CTO, and other approvals." },
    { title: "HAZOP / Safety Studies", desc: "Safety audits and risk assessments." },
    { title: "Utilities for Operation", desc: "Continuous and uninterrupted supply of electric power, service water, compressed air, and other utilities required for plant commissioning and regular operation, including infrastructure, cabling, piping, and backup systems." },
    { title: "Laboratory Instruments & Chemicals", desc: "Supply, calibration, operation, and maintenance of laboratory instruments, reagents, consumables, and chemicals required for testing during commissioning and routine operation." },
    { title: "Cranes & Heavy Handling Equipment", desc: "Provision, mobilization, operation, and demobilization of cranes, forklifts, hydras, chain blocks, or any heavy lifting equipment required for erection or maintenance." },
    { title: "Electrical Systems & Panels", desc: "Complete electrical scope including MCC panels, PLC panels, main incomer panels, transformers, cables, cable trays, earthing, VFDs, field cabling, termination, testing, and commissioning, unless explicitly included." },
    { title: "Lightning / Lighting Arrestor", desc: "Design, supply, installation, testing, and certification of lightning protection or lightning arrestor systems." },
    { title: "Plant Lighting", desc: "Supply and installation of area lighting, yard lighting, internal plant lighting, fixtures, poles, cabling, and switches for the plant premises." },
    { title: "Unspecified Items", desc: "Any item, service, activity, or material not explicitly mentioned in the scope of supply, scope of services, or commercial offer shall be deemed excluded." }
];

export const exclusionsConclusion = "Any additional items required for successful completion or operation of the plant, but not specifically mentioned in this proposal, shall be discussed and mutually agreed upon as a variation in scope.";
