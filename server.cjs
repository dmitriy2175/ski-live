var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var app = (0, import_express.default)();
var PORT = 3e3;
var mockParsedGroups = [
  {
    title: "\u0417\u0410\u0415\u0417\u0414 1",
    category: "U14 MALE",
    finishers: [
      {
        rank: "1",
        bib: "13",
        name: "\u0413\u0420\u0418\u0413\u041E\u0420\u042C\u0415\u0412 \u041D\u0418\u041A\u0418\u0422\u0410",
        resultDetails: "\u0412\u0440\u0435\u043C\u044F: 47.88",
        isLatest: false,
        status: "FINISHED"
      },
      {
        rank: "2",
        bib: "10",
        name: "\u0410\u041B\u0415\u041A\u0421\u0410\u041D\u0414\u0420\u041E\u0412 \u0414\u041C\u0418\u0422\u0420\u0418\u0419",
        resultDetails: "\u0412\u0440\u0435\u043C\u044F: 48.25",
        isLatest: false,
        status: "FINISHED"
      },
      {
        rank: "3",
        bib: "11",
        name: "\u0411\u041E\u0420\u0418\u0421\u041E\u0412 \u041C\u0410\u041A\u0421\u0418\u041C",
        resultDetails: "\u0412\u0440\u0435\u043C\u044F: 49.12",
        isLatest: false,
        status: "FINISHED"
      },
      {
        rank: "4",
        bib: "14",
        name: "\u0421\u0418\u0414\u041E\u0420\u041E\u0412 \u0418\u0412\u0410\u041D",
        resultDetails: "\u0412\u0440\u0435\u043C\u044F: 49.54",
        isLatest: false,
        status: "FINISHED"
      },
      {
        rank: "5",
        bib: "15",
        name: "\u041F\u0415\u0422\u0420\u041E\u0412 \u0421\u0415\u0420\u0413\u0415\u0419",
        resultDetails: "\u0412\u0440\u0435\u043C\u044F: 50.11",
        isLatest: false,
        status: "FINISHED"
      },
      {
        rank: "6",
        bib: "16",
        name: "\u0418\u0412\u0410\u041D\u041E\u0412 \u0410\u041B\u0415\u041A\u0421\u0415\u0419",
        resultDetails: "\u0412\u0440\u0435\u043C\u044F: 50.88",
        isLatest: false,
        status: "FINISHED"
      },
      {
        rank: "7",
        bib: "17",
        name: "\u041A\u041E\u0417\u041B\u041E\u0412 \u0410\u041D\u0414\u0420\u0415\u0419",
        resultDetails: "\u0412\u0440\u0435\u043C\u044F: 51.45",
        isLatest: false,
        status: "FINISHED"
      }
    ],
    dnfs: [
      {
        rank: "",
        bib: "12",
        name: "\u0412\u0410\u0421\u0418\u041B\u042C\u0415\u0412 \u0410\u0420\u0422\u0415\u041C",
        resultDetails: "\u0421\u0445\u043E\u0434 (DNF)",
        isLatest: false,
        status: "DNF"
      }
    ],
    dsqs: [],
    dnss: []
  },
  {
    title: "\u0418\u0422\u041E\u0413\u0418",
    category: "U14 MALE",
    finishers: [
      {
        rank: "1",
        bib: "13",
        name: "\u0413\u0420\u0418\u0413\u041E\u0420\u042C\u0415\u0412 \u041D\u0418\u041A\u0418\u0422\u0410",
        resultDetails: "\u0421\u0443\u043C\u043C\u0430: 94.98 (47.88 + 47.10)",
        isLatest: true,
        status: "FINISHED"
      },
      {
        rank: "2",
        bib: "10",
        name: "\u0410\u041B\u0415\u041A\u0421\u0410\u041D\u0414\u0420\u041E\u0412 \u0414\u041C\u0418\u0422\u0420\u0418\u0419",
        resultDetails: "\u0421\u0443\u043C\u043C\u0430: 96.20 (48.25 + 47.95)",
        isLatest: false,
        status: "FINISHED"
      },
      {
        rank: "3",
        bib: "11",
        name: "\u0411\u041E\u0420\u0418\u0421\u041E\u0412 \u041C\u0410\u041A\u0421\u0418\u041C",
        resultDetails: "\u0421\u0443\u043C\u043C\u0430: 97.92 (49.12 + 48.80)",
        isLatest: false,
        status: "FINISHED"
      },
      {
        rank: "4",
        bib: "14",
        name: "\u0421\u0418\u0414\u041E\u0420\u041E\u0412 \u0418\u0412\u0410\u041D",
        resultDetails: "\u0421\u0443\u043C\u043C\u0430: 98.74 (49.54 + 49.20)",
        isLatest: false,
        status: "FINISHED"
      },
      {
        rank: "5",
        bib: "15",
        name: "\u041F\u0415\u0422\u0420\u041E\u0412 \u0421\u0415\u0420\u0413\u0415\u0419",
        resultDetails: "\u0421\u0443\u043C\u043C\u0430: 99.96 (50.11 + 49.85)",
        isLatest: false,
        status: "FINISHED"
      },
      {
        rank: "6",
        bib: "16",
        name: "\u0418\u0412\u0410\u041D\u041E\u0412 \u0410\u041B\u0415\u041A\u0421\u0415\u0419",
        resultDetails: "\u0421\u0443\u043C\u043C\u0430: 101.40 (50.88 + 50.52)",
        isLatest: false,
        status: "FINISHED"
      },
      {
        rank: "7",
        bib: "17",
        name: "\u041A\u041E\u0417\u041B\u041E\u0412 \u0410\u041D\u0414\u0420\u0415\u0419",
        resultDetails: "\u0421\u0443\u043C\u043C\u0430: 102.90 (51.45 + 51.45)",
        isLatest: false,
        status: "FINISHED"
      }
    ],
    dnfs: [
      {
        rank: "",
        bib: "12",
        name: "\u0412\u0410\u0421\u0418\u041B\u042C\u0415\u0412 \u0410\u0420\u0422\u0415\u041C",
        resultDetails: "\u0421\u0445\u043E\u0434 (DNF)",
        isLatest: false,
        status: "DNF"
      }
    ],
    dsqs: [],
    dnss: []
  },
  {
    title: "\u0417\u0410\u0415\u0417\u0414 1",
    category: "U14 FEMALE",
    finishers: [
      {
        rank: "1",
        bib: "20",
        name: "\u0415\u0413\u041E\u0420\u041E\u0412\u0410 \u0410\u041D\u041D\u0410",
        resultDetails: "\u0412\u0440\u0435\u043C\u044F: 51.30",
        isLatest: false,
        status: "FINISHED"
      },
      {
        rank: "2",
        bib: "21",
        name: "\u0417\u0410\u0425\u0410\u0420\u041E\u0412\u0410 \u0415\u041A\u0410\u0422\u0415\u0420\u0418\u041D\u0410",
        resultDetails: "\u0412\u0440\u0435\u043C\u044F: 52.45",
        isLatest: false,
        status: "FINISHED"
      }
    ],
    dnfs: [],
    dsqs: [],
    dnss: []
  },
  {
    title: "\u0417\u0410\u0415\u0417\u0414 1",
    category: "U12 MALE",
    finishers: [
      {
        rank: "1",
        bib: "30",
        name: "\u041A\u0423\u0417\u041D\u0415\u0426\u041E\u0412 \u0414\u0410\u041D\u0418\u0418\u041B",
        resultDetails: "\u0412\u0440\u0435\u043C\u044F: 53.10",
        isLatest: false,
        status: "FINISHED"
      },
      {
        rank: "2",
        bib: "31",
        name: "\u041C\u0418\u0425\u0410\u0419\u041B\u041E\u0412 \u0415\u0413\u041E\u0420",
        resultDetails: "\u0412\u0440\u0435\u043C\u044F: 54.20",
        isLatest: false,
        status: "FINISHED"
      }
    ],
    dnfs: [],
    dsqs: [],
    dnss: []
  }
];
app.get("/api/results", (req, res) => {
  res.json(mockParsedGroups);
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
