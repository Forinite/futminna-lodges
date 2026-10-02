export const AGENT = {
  name: "Obe Fortune",
  phone: "08169835641",
  whatsapp: "08169835641",       // TODO: real number
  whatsappIntl: "2348169835641",   // digits only, with country code, for wa.me links
  callHref: "tel:+2348169835641",
};

// `key` is what is stored in the database `features` array
export const FEATURES = [
  { key: "stable_electricity", label: "Stable electricity" },
  { key: "running_water", label: "Running water" },
  { key: "well", label: "Well" },
  { key: "starlink", label: "Starlink", premium: true },
  { key: "ceiling_fan", label: "Ceiling fan" },
  { key: "modern_toilet", label: "Modern toilet" },
  { key: "kitchen", label: "Kitchen" },
  { key: "fenced", label: "Fenced compound" },
  { key: "security", label: "Security" },
];

export const naira = (n) => "₦" + Number(n).toLocaleString("en-NG");
export const VIDEO_BUCKET = "lodge-videos";
