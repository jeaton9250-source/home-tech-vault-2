import "server-only";

const OPENAI_RESPONSES_URL =
  "https://api.openai.com/v1/responses";

const DEFAULT_MODEL =
  "gpt-5.4-mini";

const MAX_SUPPORT_BYTES =
  6 * 1024 * 1024;

const MAX_MANUAL_BYTES =
  48 * 1024 * 1024;

type DomainGroup = {
  aliases: readonly string[];
  domains: readonly string[];
};

type UrlContext = {
  url: string;
  context: string;
};

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    type?: string;
    action?: {
      sources?: Array<{
        url?: string;
      }>;
    };
    content?: Array<{
      text?: string;
      annotations?: Array<{
        url?: string;
      }>;
    }>;
  }>;
};

const DOMAIN_GROUPS:
  readonly DomainGroup[] = [
  { aliases: ["Samsung"], domains: ["samsung.com"] },
  { aliases: ["LG", "LG Electronics"], domains: ["lg.com", "lge.com"] },
  { aliases: ["Sony", "PlayStation"], domains: ["sony.com", "sony.net", "playstation.com"] },
  { aliases: ["Apple"], domains: ["apple.com"] },
  { aliases: ["Belkin"], domains: ["belkin.com"] },
  { aliases: ["NETGEAR", "Netgear"], domains: ["netgear.com"] },
  { aliases: ["TP-Link", "TP Link"], domains: ["tp-link.com"] },
  { aliases: ["Linksys"], domains: ["linksys.com"] },
  { aliases: ["ASUS"], domains: ["asus.com"] },
  { aliases: ["Acer"], domains: ["acer.com"] },
  { aliases: ["Dell"], domains: ["dell.com"] },
  { aliases: ["HP", "Hewlett Packard"], domains: ["hp.com"] },
  { aliases: ["Lenovo"], domains: ["lenovo.com"] },
  { aliases: ["Microsoft", "Xbox"], domains: ["microsoft.com", "xbox.com"] },
  { aliases: ["Nintendo"], domains: ["nintendo.com"] },
  { aliases: ["Roku"], domains: ["roku.com"] },
  { aliases: ["Vizio"], domains: ["vizio.com"] },
  { aliases: ["TCL"], domains: ["tcl.com"] },
  { aliases: ["Hisense"], domains: ["hisense.com"] },
  { aliases: ["Philips", "Philips Hue", "Hue", "Signify"], domains: ["philips.com", "philips-hue.com", "signify.com"] },
  { aliases: ["Google", "Google Nest", "Nest"], domains: ["google.com"] },
  { aliases: ["Amazon", "Echo", "Fire TV"], domains: ["amazon.com"] },
  { aliases: ["Ring"], domains: ["ring.com"] },
  { aliases: ["Eufy"], domains: ["eufy.com"] },
  { aliases: ["Anker"], domains: ["anker.com"] },
  { aliases: ["Arlo"], domains: ["arlo.com"] },
  { aliases: ["Ecobee"], domains: ["ecobee.com"] },
  { aliases: ["Logitech", "Logitech G"], domains: ["logitech.com", "logitechg.com"] },
  { aliases: ["Canon"], domains: ["canon.com"] },
  { aliases: ["Epson"], domains: ["epson.com"] },
  { aliases: ["Brother"], domains: ["brother.com", "brother-usa.com"] },
  { aliases: ["Bose"], domains: ["bose.com"] },
  { aliases: ["Sonos"], domains: ["sonos.com"] },
  { aliases: ["JBL"], domains: ["jbl.com"] },
  { aliases: ["Yamaha"], domains: ["yamaha.com"] },
  { aliases: ["Denon"], domains: ["denon.com"] },
  { aliases: ["Onkyo"], domains: ["onkyo.com"] },
  { aliases: ["Whirlpool"], domains: ["whirlpool.com"] },
  { aliases: ["Maytag"], domains: ["maytag.com"] },
  { aliases: ["KitchenAid"], domains: ["kitchenaid.com"] },
  { aliases: ["Frigidaire"], domains: ["frigidaire.com"] },
  { aliases: ["GE", "GE Appliances"], domains: ["geappliances.com"] },
  { aliases: ["Bosch"], domains: ["bosch-home.com", "bosch.com"] },
  { aliases: ["Dyson"], domains: ["dyson.com"] },
  { aliases: ["Shark", "SharkNinja"], domains: ["sharkclean.com"] },
  { aliases: ["Ninja"], domains: ["ninjakitchen.com"] },
  { aliases: ["iRobot", "Roomba"], domains: ["irobot.com"] },
  { aliases: ["Roborock"], domains: ["roborock.com"] },
  { aliases: ["Honeywell", "Honeywell Home", "Resideo"], domains: ["honeywell.com", "honeywellhome.com", "resideo.com"] },
  { aliases: ["Leviton"], domains: ["leviton.com"] },
  { aliases: ["Lutron"], domains: ["lutron.com"] },
  { aliases: ["Ubiquiti", "UniFi"], domains: ["ui.com"] },
  { aliases: ["Eero"], domains: ["eero.com"] },
  { aliases: ["Motorola"], domains: ["motorola.com"] },
  { aliases: ["Arris", "CommScope"], domains: ["arris.com", "commscope.com"] },
  { aliases: ["Synology"], domains: ["synology.com"] },
  { aliases: ["QNAP"], domains: ["qnap.com"] },
  { aliases: ["Western Digital", "WD", "SanDisk"], domains: ["westerndigital.com", "sandisk.com"] },
  { aliases: ["Seagate"], domains: ["seagate.com"] },
  { aliases: ["APC", "Schneider Electric"], domains: ["apc.com", "schneider-electric.com"] },
  { aliases: ["CyberPower"], domains: ["cyberpowersystems.com"] },
  { aliases: ["Meta", "Oculus"], domains: ["meta.com"] },
  { aliases: ["Corsair"], domains: ["corsair.com"] },
  { aliases: ["Razer"], domains: ["razer.com"] },
  { aliases: ["SteelSeries"], domains: ["steelseries.com"] },
];

function compact(
  value: string
) {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9]/g,
      ""
    );
}

function resolveDomains(
  brand: string
) {
  const normalized =
    compact(
      brand
    );

  for (
    const group of
      DOMAIN_GROUPS
  ) {
    const matches =
      group.aliases.some(
        (alias) => {
          const candidate =
            compact(alias);

          return (
            candidate ===
              normalized ||
            (
              candidate.length >=
                4 &&
              normalized.includes(
                candidate
              )
            ) ||
            (
              normalized.length >=
                4 &&
              candidate.includes(
                normalized
              )
            )
          );
        }
      );

    if (matches) {
      return [
        ...group.domains,
      ];
    }
  }

  return [];
}

function hostnameAllowed(
  hostname: string,
  domains: readonly string[]
) {
  const host =
    hostname
      .trim()
      .toLowerCase()
      .replace(/\.$/, "");

  return domains.some(
    (domain) => {
      const allowed =
        domain
          .trim()
          .toLowerCase()
          .replace(/\.$/, "");

      return (
        host === allowed ||
        host.endsWith(
          `.${allowed}`
        )
      );
    }
  );
}

function trustedUrl(
  value: string,
  domains: readonly string[]
) {
  try {
    const parsed =
      new URL(value);

    if (
      parsed.protocol !==
      "https:"
    ) {
      return false;
    }

    if (
      parsed.username ||
      parsed.password
    ) {
      return false;
    }

    if (
      parsed.port &&
      parsed.port !== "443"
    ) {
      return false;
    }

    return hostnameAllowed(
      parsed.hostname,
      domains
    );
  } catch {
    return false;
  }
}

function decodeText(
  value: string
) {
  return value
    .replace(
      /\\u0026/gi,
      "&"
    )
    .replace(
      /\\u003d/gi,
      "="
    )
    .replace(
      /\\u002f/gi,
      "/"
    )
    .replace(
      /\\\//g,
      "/"
    )
    .replace(
      /&amp;/gi,
      "&"
    )
    .replace(
      /&quot;/gi,
      '"'
    );
}

function extractUrls(
  text: string
): UrlContext[] {
  const decoded =
    decodeText(text);

  const regex =
    /https:\/\/[^\s"'<>\(\)\[\]\{\}\\]+/gi;

  const results:
    UrlContext[] =
      [];

  let match:
    RegExpExecArray |
    null;

  while (
    (
      match =
        regex.exec(
          decoded
        )
    ) !== null
  ) {
    const url =
      match[0]
        .replace(
          /[.,;:]+$/g,
          ""
        )
        .trim();

    const start =
      Math.max(
        0,
        match.index - 450
      );

    const end =
      Math.min(
        decoded.length,
        match.index +
          match[0].length +
          450
      );

    results.push({
      url,
      context:
        decoded.slice(
          start,
          end
        ),
    });
  }

  return results;
}

function extractLinks(
  html: string,
  baseUrl: string
): UrlContext[] {
  const decoded =
    decodeText(html);

  const regex =
    /(?:href|src)\s*=\s*["']([^"']+)["']/gi;

  const results:
    UrlContext[] =
      [];

  let match:
    RegExpExecArray |
    null;

  while (
    (
      match =
        regex.exec(
          decoded
        )
    ) !== null
  ) {
    try {
      const url =
        new URL(
          match[1],
          baseUrl
        ).toString();

      const start =
        Math.max(
          0,
          match.index - 350
        );

      const end =
        Math.min(
          decoded.length,
          match.index +
            match[0].length +
            350
        );

      results.push({
        url,
        context:
          decoded.slice(
            start,
            end
          ),
      });
    } catch {
      continue;
    }
  }

  return results;
}


function decodeEmbeddedValue(
  value: string
) {
  let decoded =
    decodeText(
      value
    )
      .replace(
        /\\"/g,
        '"'
      )
      .replace(
        /\\\\/g,
        "\\"
      );

  /*
   * Some manufacturer page data stores URLs
   * percent-encoded inside JSON.
   */
  try {
    if (
      /%2f|%3a|%3f|%3d/i.test(
        decoded
      )
    ) {
      decoded =
        decodeURIComponent(
          decoded
        );
    }
  } catch {
    // Keep the original decoded value.
  }

  return decoded;
}


function nearestDocumentLabelContext(
  text: string,
  urlIndex: number,
  urlLength: number
) {
  const start =
    Math.max(
      0,
      urlIndex - 1200
    );

  const end =
    Math.min(
      text.length,
      urlIndex +
        urlLength +
        1200
    );

  const window =
    text.slice(
      start,
      end
    );

  const lower =
    window.toLowerCase();

  const urlCenter =
    urlIndex -
    start +
    Math.floor(
      urlLength / 2
    );

  const labels = [
    "owner's manual",
    "owner’s manual",
    "owners manual",
    "owner manual",
    "user manual",
    "operating manual",
    "instruction manual",
    "online manual",
    "user guide",
    "quick guide",
    "quick start",
    "installation guide",
    "repair guide",
    "service manual",
    "software update guide",
    "os upgrade",
    "firmware",
  ];

  let nearest:
    | {
        label: string;
        distance: number;
      }
    | null =
      null;

  for (
    const label of
      labels
  ) {
    let offset =
      0;

    while (
      offset <
      lower.length
    ) {
      const index =
        lower.indexOf(
          label,
          offset
        );

      if (
        index === -1
      ) {
        break;
      }

      const center =
        index +
        Math.floor(
          label.length / 2
        );

      const distance =
        Math.abs(
          center -
            urlCenter
        );

      if (
        !nearest ||
        distance <
          nearest.distance
      ) {
        nearest = {
          label,
          distance,
        };
      }

      offset =
        index +
        label.length;
    }
  }

  const tightStart =
    Math.max(
      0,
      urlIndex - 220
    );

  const tightEnd =
    Math.min(
      text.length,
      urlIndex +
        urlLength +
        220
    );

  const tight =
    text.slice(
      tightStart,
      tightEnd
    );

  return nearest
    ? `nearest-document-label: ${nearest.label}\n${tight}`
    : tight;
}


function parseKilobytes(
  value: string
) {
  const match =
    value.match(
      /([\d,.]+)\s*K/i
    );

  if (!match?.[1]) {
    return null;
  }

  const number =
    Number(
      match[1].replace(
        /,/g,
        ""
      )
    );

  return Number.isFinite(
    number
  )
    ? number
    : null;
}

function extractLgStructuredManuals(
  html: string
): UrlContext[] {
  const decoded =
    decodeText(
      html
    );

  const needle =
    '"manualType":"MANUAL"';

  const results:
    UrlContext[] =
      [];

  let from =
    0;

  while (
    from <
    decoded.length
  ) {
    const index =
      decoded.indexOf(
        needle,
        from
      );

    if (
      index === -1
    ) {
      break;
    }

    /*
     * LG hydrates manual metadata into page JSON.
     * Bind fields from the same nearby record
     * instead of classifying unrelated PDF names.
     */
    const start =
      Math.max(
        0,
        index - 900
      );

    const end =
      Math.min(
        decoded.length,
        index + 2600
      );

    const record =
      decoded.slice(
        start,
        end
      );

    const fileName =
      record.match(
        /"fileName":"([^"]+)"/i
      )?.[1]
        ?.trim() ??
      "";

    const originalFileName =
      record.match(
        /"originalFileName":"([^"]+)"/i
      )?.[1]
        ?.trim() ??
      "";

    const fileSize =
      record.match(
        /"fileSize":"([^"]+)"/i
      )?.[1]
        ?.trim() ??
      "";

    const language =
      record.match(
        /"fileNamePrint":"([^"]+)"/i
      )?.[1]
        ?.trim() ??
      "";

    const available =
      record.match(
        /"availableFlag":"([^"]+)"/i
      )?.[1]
        ?.trim()
        .toUpperCase() ??
      "";

    const sizeKb =
      parseKilobytes(
        fileSize
      );

    const obviouslyWrong =
      /quick|software|firmware|update guide|installation|repair|service manual/i.test(
        originalFileName
      );

    if (
      fileName &&
      available !== "N" &&
      !obviouslyWrong &&
      (
        !sizeKb ||
        sizeKb * 1024 <=
          MAX_MANUAL_BYTES
      ) &&
      (
        !language ||
        /english/i.test(
          language
        )
      )
    ) {
      const url =
        `https://gscs-b2c.lge.com/downloadFile?fileId=${encodeURIComponent(
          fileName
        )}`;

      if (
        trustedUrl(
          url,
          [
            "lg.com",
            "lge.com",
          ]
        )
      ) {
        results.push({
          url,
          context:
            [
              "LG structured manual record",
              `manualType=MANUAL`,
              originalFileName
                ? `originalFileName=${originalFileName}`
                : "",
              fileSize
                ? `fileSize=${fileSize}`
                : "",
              language
                ? `language=${language}`
                : "",
            ]
              .filter(Boolean)
              .join(" "),
        });
      }
    }

    from =
      index +
      needle.length;
  }

  return unique(
    results
  );
}

function extractEmbeddedPdfReferences(
  html: string,
  baseUrl: string
): UrlContext[] {
  const decoded =
    decodeText(
      html
    );

  /*
   * Modern support pages often keep download
   * links in hydrated JSON rather than hrefs.
   * Capture JSON string values that contain a
   * PDF path/URL and preserve nearby metadata
   * so Owner's Manual can be distinguished from
   * firmware / installation / quick guides.
   */
  const regex =
    /["']([^"']{1,1800}\.pdf(?:\?[^"']{0,1200})?)["']/gi;

  const results:
    UrlContext[] =
      [];

  let match:
    RegExpExecArray |
    null;

  while (
    (
      match =
        regex.exec(
          decoded
        )
    ) !== null
  ) {
    const raw =
      decodeEmbeddedValue(
        match[1]
      );

    let url:
      string;

    try {
      url =
        new URL(
          raw,
          baseUrl
        ).toString();
    } catch {
      continue;
    }

    results.push({
      url,
      context:
        nearestDocumentLabelContext(
          decoded,
          match.index,
          match[0].length
        ),
    });
  }

  /*
   * Also capture percent-encoded absolute PDF
   * URLs that may not contain a literal ".pdf"
   * until decoded.
   */
  const encodedRegex =
    /https%3A%2F%2F[^"'<>\\\s]{1,2400}/gi;

  while (
    (
      match =
        encodedRegex.exec(
          decoded
        )
    ) !== null
  ) {
    const raw =
      decodeEmbeddedValue(
        match[0]
      );

    if (
      !/\.pdf(?:$|[?#])/i.test(
        raw
      )
    ) {
      continue;
    }

    let url:
      string;

    try {
      url =
        new URL(
          raw
        ).toString();
    } catch {
      continue;
    }

    results.push({
      url,
      context:
        nearestDocumentLabelContext(
          decoded,
          match.index,
          match[0].length
        ),
    });
  }

  return unique(
    results
  );
}

function unique(
  values: UrlContext[]
) {
  const seen =
    new Set<string>();

  return values.filter(
    (item) => {
      if (
        seen.has(
          item.url
        )
      ) {
        return false;
      }

      seen.add(
        item.url
      );

      return true;
    }
  );
}

function looksLikeDownload(
  url: string
) {
  const lower =
    url.toLowerCase();

  return (
    lower.includes(
      ".pdf"
    ) ||
    lower.includes(
      "downloadfile"
    ) ||
    lower.includes(
      "/download/"
    ) ||
    lower.includes(
      "download?"
    )
  );
}

function looksLikeWrongDocument(
  context: string
) {
  const value =
    context.toLowerCase();

  return (
    value.includes(
      "os upgrade"
    ) ||
    value.includes(
      "upgrade guide"
    ) ||
    value.includes(
      "firmware"
    ) ||
    value.includes(
      "repair guide"
    ) ||
    value.includes(
      "service manual"
    ) ||
    value.includes(
      "installation guide"
    ) ||
    value.includes(
      "quick start"
    ) ||
    value.includes(
      "quick guide"
    )
  );
}

function looksLikeUserManual(
  candidate: UrlContext
) {
  const value =
    decodeText(
      `${candidate.url} ${candidate.context}`
    ).toLowerCase();

  if (
    looksLikeWrongDocument(
      value
    )
  ) {
    return false;
  }

  return (
    value.includes(
      "user manual"
    ) ||
    value.includes(
      "owner's manual"
    ) ||
    value.includes(
      "owners manual"
    ) ||
    value.includes(
      "owner manual"
    ) ||
    value.includes(
      "operating manual"
    ) ||
    value.includes(
      "instruction manual"
    ) ||
    value.includes(
      "owners-manual"
    ) ||
    value.includes(
      "owner-manual"
    ) ||
    value.includes(
      "user-manual"
    ) ||
    value.includes(
      "user-guide"
    ) ||
    value.includes(
      "use-and-care"
    ) ||
    value.includes(
      "use-care"
    ) ||
    value.includes(
      "operating-manual"
    ) ||
    value.includes(
      "_ug.pdf"
    ) ||
    value.includes(
      "-ug.pdf"
    ) ||
    value.includes(
      "/content/um/"
    ) ||
    value.includes(
      "_um_"
    ) ||
    value.includes(
      "%5fum%5f"
    ) ||
    value.includes(
      "cdctttype=um"
    )
  );
}

function extractSamsungUserManuals(
  html: string
): UrlContext[] {
  const decoded =
    decodeText(
      html
    );

  const objects =
    decoded.match(
      /\{[^{}]{0,14000}\}/g
    ) ?? [];

  const results:
    UrlContext[] =
      [];

  for (
    const object of
      objects
  ) {
    /*
     * Samsung has multiple PDF types on one page.
     * Require the metadata record itself to say
     * User Manual. Do not accept OS/Firmware items.
     */
    const saysUserManual =
      /"englishDescription"\s*:\s*"User Manual"/i.test(
        object
      ) ||
      /"description"\s*:\s*"User Manual"/i.test(
        object
      );

    if (
      !saysUserManual ||
      looksLikeWrongDocument(
        object
      )
    ) {
      continue;
    }

    const direct =
      object.match(
        /"downloadUrl"\s*:\s*"(https:\\?\/\\?\/[^"]+)"/i
      );

    const pathMatch =
      object.match(
        /"filePath"\s*:\s*"([^"]+\.pdf)"/i
      );

    let url:
      | string
      | null =
        null;

    if (direct?.[1]) {
      url =
        decodeText(
          direct[1]
        );
    } else if (
      pathMatch?.[1]
    ) {
      const relative =
        decodeText(
          pathMatch[1]
        )
          .replace(
            /^\/+/,
            ""
          );

      url =
        `https://downloadcenter.samsung.com/content/${relative}`;
    }

    if (
      url &&
      trustedUrl(
        url,
        ["samsung.com"]
      )
    ) {
      results.push({
        url,
        context:
          object,
      });
    }
  }

  return unique(
    results
  );
}

function collectOpenAIUrls(
  response: OpenAIResponse
) {
  const values:
    UrlContext[] =
      [];

  if (
    response.output_text
      ?.trim()
  ) {
    values.push(
      ...extractUrls(
        response.output_text
      )
    );
  }

  for (
    const item of
      response.output ?? []
  ) {
    for (
      const source of
        item.action
          ?.sources ?? []
    ) {
      if (
        source.url
          ?.trim()
      ) {
        values.push({
          url:
            source.url.trim(),
          context:
            "OpenAI web search source",
        });
      }
    }

    for (
      const part of
        item.content ?? []
    ) {
      if (
        part.text
          ?.trim()
      ) {
        values.push(
          ...extractUrls(
            part.text
          )
        );
      }

      for (
        const annotation of
          part.annotations ?? []
      ) {
        if (
          annotation.url
            ?.trim()
        ) {
          values.push({
            url:
              annotation.url.trim(),
            context:
              part.text ??
              "OpenAI citation",
          });
        }
      }
    }
  }

  return unique(
    values
  );
}

async function limitedBuffer(
  response: Response,
  maxBytes: number
) {
  const declared =
    Number(
      response.headers.get(
        "content-length"
      ) ?? "0"
    );

  if (
    Number.isFinite(
      declared
    ) &&
    declared > maxBytes
  ) {
    return null;
  }

  const buffer =
    await response
      .arrayBuffer();

  if (
    buffer.byteLength >
      maxBytes
  ) {
    return null;
  }

  return buffer;
}

async function fetchTrusted(
  inputUrl: string,
  domains: string[],
  accept: string,
  timeoutMs: number
): Promise<
  | {
      response: Response;
      url: string;
    }
  | null
> {
  let currentUrl =
    inputUrl;

  for (
    let redirects = 0;
    redirects <= 4;
    redirects += 1
  ) {
    if (
      !trustedUrl(
        currentUrl,
        domains
      )
    ) {
      return null;
    }

    let response:
      Response;

    try {
      response =
        await fetch(
          currentUrl,
          {
            method:
              "GET",
            redirect:
              "manual",
            headers: {
              Accept:
                accept,
              "Accept-Language":
                "en-US,en;q=0.9",
              "User-Agent":
                "HomeTechVault/1.0",
            },
            cache:
              "no-store",
            signal:
              AbortSignal.timeout(
                timeoutMs
              ),
          }
        );
    } catch {
      return null;
    }

    if (
      [
        301,
        302,
        303,
        307,
        308,
      ].includes(
        response.status
      )
    ) {
      const location =
        response.headers.get(
          "location"
        );

      if (!location) {
        return null;
      }

      let next:
        string;

      try {
        next =
          new URL(
            location,
            currentUrl
          ).toString();
      } catch {
        return null;
      }

      if (
        !trustedUrl(
          next,
          domains
        )
      ) {
        return null;
      }

      currentUrl =
        next;

      continue;
    }

    return {
      response,
      url:
        currentUrl,
    };
  }

  return null;
}

async function downloadPdf(
  inputUrl: string,
  domains: string[]
): Promise<
  Uint8Array |
  null
> {
  const fetched =
    await fetchTrusted(
      inputUrl,
      domains,
      "application/pdf,application/octet-stream;q=0.9,*/*;q=0.5",
      15_000
    );

  if (
    !fetched
      ?.response
      .ok
  ) {
    return null;
  }

  const buffer =
    await limitedBuffer(
      fetched.response,
      MAX_MANUAL_BYTES
    );

  if (
    !buffer ||
    buffer.byteLength <
      5
  ) {
    return null;
  }

  const bytes =
    new Uint8Array(
      buffer
    );

  const signature =
    String.fromCharCode(
      ...bytes.slice(
        0,
        5
      )
    );

  return signature ===
    "%PDF-"
    ? bytes
    : null;
}

async function searchWithOpenAI({
  brand,
  modelNumber,
  deviceName,
  domains,
}: {
  brand: string;
  modelNumber: string;
  deviceName: string;
  domains: string[];
}) {
  const apiKey =
    process.env
      .OPENAI_API_KEY
      ?.trim();

  if (!apiKey) {
    console.warn(
      "[manual-openai] OPENAI_API_KEY missing"
    );

    return null;
  }

  const model =
    process.env
      .OPENAI_MANUAL_MODEL
      ?.trim() ||
    DEFAULT_MODEL;

  const prompt = [
    "Use web search to locate the correct official user manual for this consumer device.",
    "",
    `Brand: ${brand}`,
    `Saved model: ${modelNumber}`,
    `Device name: ${deviceName}`,
    "",
    "The saved model may be a product family instead of a complete regional SKU.",
    "Search only the allowed official manufacturer domains.",
    "Prefer United States documentation; Canada is acceptable when it clearly covers the same North American product family.",
    "Find the official English User Manual / Owner Manual. Prefer a downloadable PDF when one exists.",
    "If the manufacturer provides the manual primarily as an official web-based User Guide instead of a PDF, identify that official guide page.",
    "Official manufacturer asset/CDN subdomains are valid when they are subdomains of an allowed manufacturer domain.",
    "When an official User Guide or Owner Manual PDF exists, include the direct PDF URL in your answer even when the filename is opaque.",
    "Do not return OS upgrade guides, firmware files, repair guides, installation guides, quick-start guides, brochures, generic safety guides, personal safety guides, privacy guides, accessibility guides, legal guides, regulatory guides, retailers, forums, mirrors, ManualsLib, Scribd, or third-party sources.",
    "Do not treat manufacturer-wide documentation as a product manual unless it explicitly applies to the requested product or product family.",
    "For Apple products, reject generic Apple-wide documents such as Personal Safety, privacy, legal, accessibility, regulatory, or general Apple device guides when searching for a specific product.",
    "A family-level manual is acceptable only when the official manufacturer shows that it applies to the saved product family.",
    "Do not invent URLs or exact model suffixes.",
    "",
    "When verified, include plain-text lines:",
    "SUPPORT: https://...",
    "MANUAL: https://...",
    "GUIDE: https://...",
    "MANUAL_TYPE: User Manual",
    "",
    "MANUAL should contain a direct official PDF URL when available.",
    "GUIDE should contain an official manufacturer web-based user guide when no PDF is available.",
    "Never use a retailer, forum, mirror, ManualsLib, Scribd, or other third-party guide.",
    "If no applicable official user manual or official web guide can be verified, say NOT_FOUND.",
  ].join("\n");

  try {
    console.info(
      "[manual-openai] searching official manufacturer",
      {
        brand,
        modelNumber,
        domains,
        model,
      }
    );

    const response =
      await fetch(
        OPENAI_RESPONSES_URL,
        {
          method:
            "POST",
          headers: {
            Authorization:
              `Bearer ${apiKey}`,
            "Content-Type":
              "application/json",
          },
          body:
            JSON.stringify({
              model,
              input:
                prompt,
              tools: [
                {
                  type:
                    "web_search",
                  filters: {
                    allowed_domains:
                      domains,
                  },
                  search_context_size:
                    "medium",
                  user_location: {
                    type:
                      "approximate",
                    country:
                      "US",
                  },
                },
              ],
              include: [
                "web_search_call.action.sources",
              ],
              max_output_tokens:
                700,
              store:
                false,
            }),
          cache:
            "no-store",
          signal:
            AbortSignal.timeout(
              30_000
            ),
        }
      );

    if (!response.ok) {
      let detail =
        "";

      try {
        const body =
          (await response.json()) as {
            error?: {
              message?: string;
            };
          };

        detail =
          body.error?.message ??
          "";
      } catch {
        detail =
          "";
      }

      console.warn(
        "[manual-openai] search failed",
        response.status,
        detail
      );

      return null;
    }

    return (
      await response.json()
    ) as OpenAIResponse;
  } catch (error) {
    console.warn(
      "[manual-openai] search error",
      error instanceof Error
        ? error.message
        : "unknown"
    );

    return null;
  }
}


export async function resolveOfficialManualWebGuide({
  brand,
  modelNumber,
  deviceName,
}: {
  brand: string;
  modelNumber: string;
  deviceName: string;
}): Promise<string | null> {
  const cleanBrand =
    brand.trim();

  const cleanModel =
    modelNumber.trim();

  const cleanDeviceName =
    deviceName.trim();

  if (
    !cleanBrand ||
    !cleanModel
  ) {
    return null;
  }

  const domains =
    resolveDomains(
      cleanBrand
    );

  if (
    domains.length === 0
  ) {
    console.info(
      "[manual-openai] no approved manufacturer domain for web guide",
      {
        brand:
          cleanBrand,
      }
    );

    return null;
  }

  const search =
    await searchWithOpenAI({
      brand:
        cleanBrand,
      modelNumber:
        cleanModel,
      deviceName:
        cleanDeviceName,
      domains,
    });

  if (!search) {
    return null;
  }

  /*
   * Normalize text so:
   *
   * A2589
   * A-2589
   * A 2589
   *
   * can be compared reliably.
   */
  const compact = (
    value: string
  ) =>
    value
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        ""
      );

  const words = (
    value: string
  ) =>
    value
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        " "
      )
      .split(/\s+/)
      .filter(
        (word) =>
          word.length >= 3
      )
      .filter(
        (word) =>
          ![
            "the",
            "and",
            "with",
            "wifi",
            "cellular",
            "generation",
            "model",
            "official",
            "guide",
            "manual",
            "support",
          ].includes(
            word
          )
      );

  const modelCompact =
    compact(
      cleanModel
    );

  const deviceWords =
    Array.from(
      new Set(
        words(
          cleanDeviceName
        )
      )
    );

  const responseText =
    [
      search.output_text ??
        "",
      ...(search.output ?? [])
        .flatMap(
          (item) =>
            item.content ?? []
        )
        .map(
          (content) =>
            content.text ??
            ""
        ),
    ].join("\n");

  /*
   * Include an explicitly supplied GUIDE URL,
   * but DO NOT automatically choose it.
   *
   * OpenAI may return a generic guide root even
   * when its citations contain a much better
   * exact-product page.
   */
  const explicitGuide =
    responseText.match(
      /(?:^|\n)\s*GUIDE:\s*(https:\/\/[^\s<>"']+)/i
    )?.[1] ??
    null;

  const rawCandidates =
    collectOpenAIUrls(
      search
    )
      .filter(
        (item) =>
          trustedUrl(
            item.url,
            domains
          )
      )
      .filter(
        (item) =>
          !looksLikeDownload(
            item.url
          )
      );

  if (
    explicitGuide &&
    trustedUrl(
      explicitGuide,
      domains
    ) &&
    !looksLikeDownload(
      explicitGuide
    )
  ) {
    rawCandidates.push({
      url:
        explicitGuide,
      context:
        "OpenAI explicit GUIDE result",
    });
  }

  /*
   * De-duplicate before ranking.
   */
  const candidates =
    Array.from(
      new Map(
        rawCandidates.map(
          (candidate) => [
            candidate.url,
            candidate,
          ]
        )
      ).values()
    );

  function scoreCandidate(
    candidate: {
      url: string;
      context: string;
    }
  ) {
    const url =
      candidate.url
        .toLowerCase();

    const evidence =
      (
        candidate.url +
        " " +
        candidate.context
      ).toLowerCase();

    const compactEvidence =
      compact(
        evidence
      );

    let score = 0;

    /*
     * Strongest possible evidence:
     * exact manufacturer model number.
     */
    if (
      modelCompact &&
      compactEvidence.includes(
        modelCompact
      )
    ) {
      score += 200;
    }

    /*
     * Product-name overlap.
     *
     * Example:
     * "iPad Air 5th generation"
     * should outrank a generic
     * /guide/ipad/welcome page.
     */
    let matchedWords = 0;

    for (
      const word of
        deviceWords
    ) {
      if (
        evidence.includes(
          word
        )
      ) {
        matchedWords += 1;
      }
    }

    score +=
      matchedWords * 18;

    if (
      deviceWords.length > 0 &&
      matchedWords >=
        Math.min(
          2,
          deviceWords.length
        )
    ) {
      score += 50;
    }

    /*
     * Generic manufacturer-wide documentation
     * must never outrank a real product manual.
     *
     * Example:
     * "Personal Safety — User Guide for Apple devices"
     * is not a HomePod mini manual.
     */
    const genericNonProductGuide =
      /personal safety|safety guide|privacy guide|accessibility guide|legal guide|regulatory guide|general safety|for apple devices/.test(
        evidence
      );

    if (
      genericNonProductGuide
    ) {
      score -= 1000;
    }

    /*
     * Positive guide signals.
     */
    if (
      /user[-\s]?guide|user[-\s]?manual|owner'?s?[-\s]?manual/.test(
        evidence
      )
    ) {
      score += 35;
    }

    if (
      /\/guide\//.test(
        url
      )
    ) {
      score += 20;
    }

    if (
      /support/.test(
        url
      )
    ) {
      score += 8;
    }

    /*
     * Generic roots should lose to an
     * exact-product guide whenever possible.
     */
    if (
      /\/welcome(?:\/|$|\?)/.test(
        url
      )
    ) {
      score -= 120;
    }

    if (
      /\/support\/?$/.test(
        url
      )
    ) {
      score -= 100;
    }

    if (
      /\/guide\/[^/]+\/?$/.test(
        url
      )
    ) {
      score -= 45;
    }

    /*
     * Reject clearly incorrect documentation.
     */
    if (
      /firmware|driver|software update|repair manual|service manual|installation guide|quick start|quickstart|brochure|personal safety|safety guide|privacy guide|accessibility guide|legal guide|regulatory guide|general safety|for apple devices/.test(
        evidence
      )
    ) {
      score -= 500;
    }

    return {
      candidate,
      score,
      matchedWords,
    };
  }

  const ranked =
    candidates
      .map(
        scoreCandidate
      )
      .sort(
        (a, b) =>
          b.score -
          a.score
      );

  console.info(
    "[manual-openai] ranked official web-guide candidates",
    ranked
      .slice(
        0,
        6
      )
      .map(
        ({
          candidate,
          score,
          matchedWords,
        }) => ({
          url:
            candidate.url,
          score,
          matchedWords,
        })
      )
  );

  /*
   * Require at least meaningful guide/product
   * evidence. A generic manufacturer support
   * homepage should never become a "manual".
   */
  const best =
    ranked.find(
      ({
        candidate,
        score,
      }) => {
        if (
          score < 20
        ) {
          return false;
        }

        const evidence =
          (
            candidate.url +
            " " +
            candidate.context
          ).toLowerCase();

        const clearlyWrongDocument =
          /firmware|driver|software update|repair manual|service manual|installation guide|quick start|quickstart|brochure|personal safety|safety guide|privacy guide|accessibility guide|legal guide|regulatory guide|general safety|for apple devices/.test(
            evidence
          );

        if (
          clearlyWrongDocument
        ) {
          return false;
        }

        const compactCandidateEvidence =
          compact(
            evidence
          );

        const exactModelMatch =
          Boolean(
            modelCompact &&
            compactCandidateEvidence.includes(
              modelCompact
            )
          );

        let productWordMatches =
          0;

        for (
          const word of
            deviceWords
        ) {
          if (
            evidence.includes(
              word
            )
          ) {
            productWordMatches +=
              1;
          }
        }

        /*
         * Never accept a generic "User Guide"
         * solely because it contains those words.
         * It must also match the requested model
         * or product name.
         */
        const hasGuideIntent =
          /user[-\s]?guide|user[-\s]?manual|owner'?s?[-\s]?manual|owner'?s?[-\s]?guide|\/guide\/|\/manual(?:s)?(?:\/|$|\?)/.test(
            evidence
          );

        if (!hasGuideIntent) {
          return false;
        }

        return (
          exactModelMatch ||
          productWordMatches > 0
        );
      }
    );

  if (!best) {
    console.info(
      "[manual-openai] no sufficiently specific official web guide found"
    );

    return null;
  }

  console.info(
    "[manual-openai] selected official web guide",
    {
      url:
        best.candidate.url,
      score:
        best.score,
      model:
        cleanModel,
      deviceName:
        cleanDeviceName,
    }
  );

  return best.candidate.url;
}

export async function resolveOfficialManualPdf({
  brand,
  modelNumber,
  deviceName,
}: {
  brand: string;
  modelNumber: string;
  deviceName: string;
}): Promise<
  Uint8Array |
  null
> {
  const cleanBrand =
    brand.trim();

  const cleanModel =
    modelNumber.trim();

  if (
    !cleanBrand ||
    !cleanModel
  ) {
    return null;
  }

  const domains =
    resolveDomains(
      cleanBrand
    );

  if (
    domains.length ===
    0
  ) {
    console.info(
      "[manual-openai] no approved manufacturer domain",
      {
        brand:
          cleanBrand,
      }
    );

    return null;
  }

  const search =
    await searchWithOpenAI({
      brand:
        cleanBrand,
      modelNumber:
        cleanModel,
      deviceName,
      domains,
    });

  if (!search) {
    return null;
  }

  const urls =
    collectOpenAIUrls(
      search
    )
      .filter(
        (item) =>
          trustedUrl(
            item.url,
            domains
          )
      );

  console.info(
    "[manual-openai] trusted candidates",
    urls.length
  );

  const isSamsung =
    domains.includes(
      "samsung.com"
    );

  const compactPdfEvidence = (
    value: string
  ) =>
    value
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        ""
      );

  const brandWords =
    new Set(
      cleanBrand
        .toLowerCase()
        .replace(
          /[^a-z0-9]+/g,
          " "
        )
        .split(/\s+/)
        .filter(Boolean)
    );

  const productWords =
    Array.from(
      new Set(
        deviceName
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            " "
          )
          .split(/\s+/)
          .filter(Boolean)
          .filter(
            (word) =>
              word.length >= 4
          )
          .filter(
            (word) =>
              !brandWords.has(
                word
              )
          )
          .filter(
            (word) =>
              ![
                "mini",
                "plus",
                "max",
                "pro",
                "ultra",
                "smart",
                "series",
                "generation",
                "wifi",
                "wireless",
                "cellular",
                "model",
                "device",
                "edition",
                "version",
                "inch",
              ].includes(word)
          )
      )
    );

  const modelCompact =
    compactPdfEvidence(
      cleanModel
    );

  const simpleRequestedModel =
    modelCompact.length >= 4 &&
    modelCompact.length <= 12 &&
    /^[a-z]{1,8}\d{2,}[a-z]{0,5}$/.test(
      modelCompact
    )
      ? modelCompact
      : null;

  function hasConflictingSiblingModel(
    evidence: string
  ) {
    if (!simpleRequestedModel) {
      return false;
    }

    const requestedMatch =
      simpleRequestedModel.match(
        /^([a-z]+)(\d+)([a-z]*)$/
      );

    if (!requestedMatch) {
      return false;
    }

    const requestedPrefix =
      requestedMatch[1];

    const requestedDigits =
      requestedMatch[2];

    const candidateTokens =
      evidence
        .toLowerCase()
        .match(
          /\b[a-z]{1,8}\d{2,}[a-z]{0,5}\b/g
        ) ?? [];

    for (
      const token of
        candidateTokens
    ) {
      const compactToken =
        compactPdfEvidence(
          token
        );

      if (
        compactToken ===
        simpleRequestedModel
      ) {
        continue;
      }

      const candidateMatch =
        compactToken.match(
          /^([a-z]+)(\d+)([a-z]*)$/
        );

      if (!candidateMatch) {
        continue;
      }

      const candidatePrefix =
        candidateMatch[1];

      const candidateDigits =
        candidateMatch[2];

      if (
        candidatePrefix ===
          requestedPrefix &&
        candidateDigits !==
          requestedDigits
      ) {
        return true;
      }
    }

    return false;
  }

  function candidateMatchesProduct(
    candidate: {
      url: string;
      context: string;
    }
  ) {
    const evidence =
      (
        candidate.url +
        " " +
        candidate.context
      ).toLowerCase();

    const compactEvidence =
      compactPdfEvidence(
        evidence
      );

    const wrongDocument =
      /personal safety|safety guide|privacy guide|accessibility guide|legal guide|regulatory guide|general safety|quick start|quickstart|quick guide|installation guide|repair manual|service manual|service guide|firmware|software update|brochure|spec sheet|datasheet/.test(
        evidence
      );

    if (wrongDocument) {
      return false;
    }

    if (
      modelCompact &&
      compactEvidence.includes(
        modelCompact
      )
    ) {
      return true;
    }

    if (
      hasConflictingSiblingModel(
        evidence
      )
    ) {
      return false;
    }

    return productWords.some(
      (word) =>
        evidence.includes(
          word
        )
    );
  }

  /*
   * Direct PDF candidates are accepted only
   * when the surrounding evidence identifies
   * them as an actual user/owner manual.
   */
  for (
    const candidate of
      urls.filter(
        (item) =>
          looksLikeDownload(
            item.url
          ) &&
          looksLikeUserManual(
            item
          ) &&
          candidateMatchesProduct(
            item
          )
      )
      .slice(
        0,
        5
      )
  ) {
    const pdf =
      await downloadPdf(
        candidate.url,
        domains
      );

    if (pdf) {
      console.info(
        "[manual-openai] verified direct official User Manual PDF"
      );

      return pdf;
    }
  }

  const supportPages =
    urls.filter(
      (item) =>
        !looksLikeDownload(
          item.url
        ) &&
        candidateMatchesProduct(
          item
        )
    )
      .slice(
        0,
        6
      );

  for (
    const support of
      supportPages
  ) {
    console.info(
      "[manual-openai] inspecting official support page",
      support.url
    );

    const page =
      await fetchTrusted(
        support.url,
        domains,
        "text/html,application/xhtml+xml",
        12_000
      );

    if (
      !page
        ?.response
        .ok
    ) {
      continue;
    }

    const body =
      await limitedBuffer(
        page.response,
        MAX_SUPPORT_BYTES
      );

    if (!body) {
      continue;
    }

    const html =
      new TextDecoder()
        .decode(
          body
        );

    const isLg =
      domains.includes(
        "lg.com"
      ) ||
      domains.includes(
        "lge.com"
      );

    if (isLg) {
      const lgManuals =
        extractLgStructuredManuals(
          html
        );

      console.info(
        "[manual-openai] LG structured manual candidates",
        lgManuals.length
      );

      for (
        const manual of
          lgManuals.slice(
            0,
            4
          )
      ) {
        const pdf =
          await downloadPdf(
            manual.url,
            domains
          );

        if (pdf) {
          console.info(
            "[manual-openai] verified LG Owner's Manual PDF"
          );

          return pdf;
        }
      }
    }

    if (isSamsung) {
      const manuals =
        extractSamsungUserManuals(
          html
        );

      console.info(
        "[manual-openai] Samsung User Manual candidates",
        manuals.length
      );

      for (
        const manual of
          manuals.slice(
            0,
            4
          )
      ) {
        const pdf =
          await downloadPdf(
            manual.url,
            domains
          );

        if (pdf) {
          console.info(
            "[manual-openai] verified Samsung User Manual PDF"
          );

          return pdf;
        }
      }

      /*
       * Do not fall through to arbitrary Samsung
       * PDFs from this page. Samsung pages contain
       * OS, firmware, installation, and repair docs.
       */
      continue;
    }

    const embeddedPdfReferences =
      extractEmbeddedPdfReferences(
        html,
        page.url
      );

    if (
      domains.includes(
        "lg.com"
      )
    ) {
      console.info(
        "[manual-openai] LG embedded PDF candidates",
        embeddedPdfReferences.length
      );
    }

    const links =
      unique([
        ...extractUrls(
          html
        ),
        ...extractLinks(
          html,
          page.url
        ),
        ...embeddedPdfReferences,
      ])
        .filter(
          (item) =>
            trustedUrl(
              item.url,
              domains
            ) &&
            looksLikeDownload(
              item.url
            ) &&
            looksLikeUserManual(
              item
            ) &&
            candidateMatchesProduct(
              item
            )
        )
        .slice(
          0,
          6
        );

    for (
      const candidate of
        links
    ) {
      const pdf =
        await downloadPdf(
          candidate.url,
          domains
        );

      if (pdf) {
        console.info(
          "[manual-openai] verified official manufacturer User Manual PDF"
        );

        return pdf;
      }
    }
  }

  console.info(
    "[manual-openai] no verified official User Manual PDF found"
  );

  return null;
}
