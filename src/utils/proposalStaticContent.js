export const staticDesignBasis = {
    intro: "The design basis is based on the paper production of 300 TPD.",
    parameters: [
        { sn: 1, param: "Flow", unit: "m3/day", raw: "6000", anaInlet: "4890" },
        { sn: 2, param: "sCOD", unit: "mg/l", raw: "5000", anaInlet: "5000" },
        { sn: 3, param: "BOD", unit: "mg/l", raw: "2500", anaInlet: "2500" },
        { sn: 4, param: "TSS", unit: "mg/l", raw: "4000", anaInlet: "<300" },
        { sn: 5, param: "VFA", unit: "meq/l", raw: "30", anaInlet: "<30" },
        { sn: 6, param: "Calcium", unit: "mg/l", raw: "<600", anaInlet: "<600" },
        { sn: 7, param: "Sulphate", unit: "mg/l", raw: "<200", anaInlet: "<200" },
        { sn: 8, param: "ORP", unit: "mg/l", raw: "-100 to -150", anaInlet: "-100 to -150" },
        { sn: 9, param: "NH4-N", unit: "mg/l", raw: "0", anaInlet: "0" },
        { sn: 10, param: "PO4-P", unit: "mg/l", raw: "0", anaInlet: "0" },
        { sn: 11, param: "Heavy metals (Cu, Zn, Co, Mn, Hg, etc...)", unit: "mg/l", raw: "Nil", anaInlet: "Nil" },
        { sn: 12, param: "Bromide", unit: "mg/l", raw: "Nil", anaInlet: "Nil" },
        { sn: 13, param: "Temperature", unit: "°C", raw: "30 - 38", anaInlet: "30 - 38" }
    ],
    notes: [
        "Client has to ensure the feed limiting parameters like pH, TSS and temperature are maintaining well within the limit.",
        "Client has to avoid using bromine based biocide in the mill as it is a strong oxidant.",
        "Client has to ensure all the mill chemicals used in the wet end get prior approval from EDI enviro."
    ]
};

export const staticGuarantees = {
    anaerobic: [
        { sn: 1, param: "sCOD removal %", unit: ">70% of 5000 mg/l" },
        { sn: 2, param: "sCOD", unit: "<1500 mg/l" },
        { sn: 3, param: "Biogas generation", unit: "0.40 – 0.5 Nm3/kg sCOD rem" }
    ],
    secondary: [
        { sn: 4, param: "sCOD", unit: "200 - 300 mg/l" },
        { sn: 5, param: "BOD", unit: "<30 mg/l" },
        { sn: 6, param: "TSS", unit: "<100 mg/l" },
        { sn: 7, param: "VFA", unit: "<1 meq/l" }
    ],
    notes: [
        "The above guarantee shall be applicable only if the client strictly adheres to EDI’s operational guidelines.",
        "The anaerobic reactor performance may vary depending on key parameters such as pH, temperature, total suspended solids (TSS), and the presence of toxic elements.",
        "Biogas generation may decrease if the influent sulfate (SO₄) concentration increases.",
        "Acid sizing chemicals shall not be applied in the wet end of the process.",
        "The client shall restrict the use of oxidizing biocides within the paper mill.",
        "The client shall ensure a discharge of 300 to 400 m³/day of treated water and maintain a freshwater intake of approximately 750 to 850 m³/day to the paper mill. Approximately 4,300 m³/day of treated water will be recycled to the pulper post-treatment.",
        "Treated water shall be utilized exclusively in the pulping section.",
        "Mill retention shall be <24 hrs."
    ]
};

export const theoryContent = {
    bromide: {
        title: "Impact of Bromide",
        text: "Anaerobic microbes (like methanogens, fermenters, sulfate reducers) are sensitive to halogens and oxidizing compounds. Here’s what’s known:",
        table: [
            { compound: "Bromide (Br-)", effect: "Low toxicity", notes: "Generally tolerated up to several hundred mg/L in anaerobic digesters." },
            { compound: "Hypobromous acid (HOBr)", effect: "Highly toxic", notes: "Even low mg/L levels can inhibit methanogenesis." },
            { compound: "Bromate (BrO3-)", effect: "Strongly inhibitory", notes: "Acts as an oxidant; damages enzymes and cell walls." },
            { compound: "Organic bromides", effect: "Variable", notes: "Some (like bromoform, CHBr3) can strongly inhibit methanogens." }
        ]
    },
    heavyMetals: {
        title: "Impact of heavy metals",
        table: [
            { metal: "Zinc (Zn2+)", role: "Cofactor for hydrolases, dehydrogenases", range: "0.05 – 1", toxic: ">5 – 10", comments: "Toxicity increases with lower pH due to higher solubility." },
            { metal: "Cobalt (Co2+)", role: "Essential for methanogens (coenzyme B12 synthesis)", range: "0.05 – 0.5", toxic: ">1 – 2", comments: "Needed in trace amounts; excess inhibits methanogenesis." },
            { metal: "Manganese (Mn2+)", role: "Enzyme activator, antioxidant defense", range: "0.1 – 1", toxic: ">10 – 50", comments: "Less toxic than other heavy metals; moderate tolerance." },
            { metal: "Copper (Cu2+)", role: "Cofactor in redox enzymes", range: "0.02 – 0.2", toxic: ">1 – 3", comments: "Highly toxic; binds to cell membranes and inhibits enzymes." },
            { metal: "Nickel (Ni2+)", role: "Vital for hydrogenases and coenzyme F430", range: "0.05 – 1", toxic: ">5 – 10", comments: "Both deficiency and excess cause inhibition." },
            { metal: "Iron (Fe2+/Fe3+)", role: "Electron carrier, cytochromes, ferredoxins", range: "1 – 5", toxic: ">100", comments: "Generally beneficial; precipitates sulfide and reduces toxicity of other metals." }
        ]
    },
    vfa: {
        title: "Impact of higher VFA",
        text: `In recycled fiber (RCF)-based paper mills, an elevated concentration of volatile fatty acids (VFAs) in the wastewater can significantly influence both the chemical and biological processes within the anaerobic treatment system.

When the VFA concentration increases, these organic acids (such as acetic, propionic, and butyric acids) tend to dissociate calcium carbonate (CaCO3) present in the system. This reaction leads to the formation of calcium acetate (Ca(CH3COO)2). The relationship can be represented as follows:
CaCO3 + 2CH3COOH → Ca(CH3COO)2 + H2O + CO2
Thus, higher VFA levels result in increased calcium acetate formation.

Under anaerobic conditions, calcium acetate serves as an additional carbon source and is subsequently degraded by methanogenic microorganisms to produce biogas (methane and carbon dioxide). However, during this process, the released calcium ions tend to precipitate or deposit onto the biomass surface, forming calcium coatings on the granular sludge or biofilm.

Such calcium deposition can have several negative consequences:
• It reduces the effective surface area available for microbial activity.
• It increases sludge density, potentially leading to poor settling or granule disintegration.
• It may interfere with mass transfer, thereby lowering overall reactor efficiency.

To prevent excessive calcium precipitation and maintain stable anaerobic performance, it is essential to control the degree of pre-acidification in the upstream process. Maintaining the pre-acidification degree below 40% helps:
• Limit VFA accumulation and subsequent calcium acetate formation.
• Preserve the structural integrity of anaerobic biomass.
• Ensure steady biogas production and reactor stability.`
    }
};
