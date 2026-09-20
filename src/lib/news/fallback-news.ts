import type { NewsArticle } from "./types";

/**
 * Seeded demo articles used when no feed is configured or the feed fails.
 * They point to real public pages so the "Read more" links work in a demo.
 */
export const FALLBACK_NEWS: NewsArticle[] = [
  {
    id: "fallback-1",
    title: "Machine learning model predicts protein folding pathways with new precision",
    summary:
      "Researchers combined structural biology datasets with a transformer model to predict intermediate folding states, a step toward understanding misfolding diseases.",
    url: "https://www.sciencedaily.com/news/computers_math/artificial_intelligence/",
    source: "ScienceDaily",
    category: "Computer Science",
    published_at: "2026-09-18T09:00:00Z",
  },
  {
    id: "fallback-2",
    title: "Coral microbiome shifts signal reef stress months before bleaching",
    summary:
      "A multi-year survey shows that changes in coral-associated bacteria can act as an early warning system for heat stress events.",
    url: "https://www.sciencedaily.com/news/earth_climate/",
    source: "ScienceDaily",
    category: "Environmental Science",
    published_at: "2026-09-17T14:30:00Z",
  },
  {
    id: "fallback-3",
    title: "Webb telescope spots unexpected carbon chemistry in a young planetary disk",
    summary:
      "Spectra from a nearby protoplanetary disk reveal hydrocarbon molecules in regions where rocky planets may be forming.",
    url: "https://phys.org/space-news/",
    source: "Phys.org",
    category: "Astronomy",
    published_at: "2026-09-16T11:15:00Z",
  },
  {
    id: "fallback-4",
    title: "Room-temperature quantum sensor built from diamond defects",
    summary:
      "Physicists demonstrate a compact magnetometer using nitrogen-vacancy centers that works without cryogenic cooling.",
    url: "https://phys.org/physics-news/",
    source: "Phys.org",
    category: "Physics",
    published_at: "2026-09-15T08:45:00Z",
  },
  {
    id: "fallback-5",
    title: "Enzyme cascade converts plastic waste into useful chemicals",
    summary:
      "A three-enzyme pathway breaks PET into building blocks that can be re-polymerized, offering a low-energy recycling route.",
    url: "https://www.sciencedaily.com/news/matter_energy/chemistry/",
    source: "ScienceDaily",
    category: "Chemistry",
    published_at: "2026-09-14T16:00:00Z",
  },
  {
    id: "fallback-6",
    title: "Gut bacteria influence memory formation in mice, study finds",
    summary:
      "Germ-free mice showed altered hippocampal activity that was restored after recolonization with specific bacterial strains.",
    url: "https://www.sciencedaily.com/news/mind_brain/",
    source: "ScienceDaily",
    category: "Biology",
    published_at: "2026-09-13T10:20:00Z",
  },
  {
    id: "fallback-7",
    title: "Open dataset of 10,000 student research projects released for meta-analysis",
    summary:
      "The collection includes abstracts, methods and outcomes, enabling studies on how early research experience shapes scientific careers.",
    url: "https://phys.org/science-news/",
    source: "Phys.org",
    category: "Computer Science",
    published_at: "2026-09-12T13:00:00Z",
  },
  {
    id: "fallback-8",
    title: "Urban heat islands mapped street by street with low-cost sensors",
    summary:
      "A citizen-science network of 400 sensors shows temperature differences of up to 7 °C within a single city district.",
    url: "https://phys.org/earth-news/",
    source: "Phys.org",
    category: "Environmental Science",
    published_at: "2026-09-11T09:30:00Z",
  },
];
