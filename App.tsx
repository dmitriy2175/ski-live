import { db, ref, onValue } from "./firebase";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Award,
    Clock,
    SlidersVertical,
    ArrowUpRight,
    X,
    Timer,
} from "lucide-react";

import { Participant, Group } from "./types";
// @ts-expect-error - image asset
import snowfoxLogo from "./assets/images/snowfox_logo_1784286885918.jpg";

function getDisplayTimes(resultDetails: string) {
    if (!resultDetails) return { mainTime: "0.00", hasSum: false, sumStr: "" };

    const sumRegex = /(?:Сумма|Sum|Сумма времени):\s*([0-9.]+)\s*\(\s*([0-9.]+)\s*\+\s*([0-9.]+)\s*\)/i;
    const match = resultDetails.match(sumRegex);
    if (match) {
        const sum = parseFloat(match[1]);
        const run1 = parseFloat(match[2]);
        const run2 = parseFloat(match[3]);
        return {
            mainTime: run2.toFixed(2),
            hasSum: true,
            sumStr: `Сумма: ${sum.toFixed(2)} (${run1.toFixed(2)} + ${run2.toFixed(2)})`
        };
    }

    const timeRegex = /(?:Время|Time):\s*([0-9.]+)/i;
    const matchTime = resultDetails.match(timeRegex);
    if (matchTime) {
        return {
            mainTime: parseFloat(matchTime[1]).toFixed(2),
            hasSum: false,
            sumStr: ""
        };
    }

    const numMatch = resultDetails.match(/[0-9.]+/);
    if (numMatch) {
        return {
            mainTime: parseFloat(numMatch[0]).toFixed(2),
            hasSum: false,
            sumStr: ""
        };
    }

    return {
        mainTime: resultDetails,
        hasSum: false,
        sumStr: ""
    };
}

function parseRuns(resultDetails: string) {
    if (!resultDetails) return null;
    const sumRegex = /(?:Сумма|Sum|Сумма времени):\s*([0-9.]+)\s*\(\s*([0-9.]+)\s*\+\s*([0-9.]+)\s*\)/i;
    const match = resultDetails.match(sumRegex);
    if (match) {
        return {
            run1: match[2],
            run2: match[3],
            total: match[1],
            isSum: true
        };
    }
    const timeRegex = /(?:Время|Time):\s*([0-9.]+)/i;
    const matchTime = resultDetails.match(timeRegex);
    if (matchTime) {
        return {
            run1: matchTime[1],
            isSum: false
        };
    }
    const numMatch = resultDetails.match(/[0-9.]+/);
    if (numMatch) {
        return {
            run1: numMatch[0],
            isSum: false
        };
    }
    return null;
}

export default function App() {
    const [apiResults, setApiResults] = useState<Group[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<Date>(new Date());
    const [filterCategory, setFilterCategory] = useState<string>("ВСЕ");
    const [filterGender, setFilterGender] = useState<string>("ВСЕ");
    const [selectedAthlete, setSelectedAthlete] = useState<{
        athlete: Participant;
        groupTitle: string;
    } | null>(null);

    // Current clock time interval
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Realtime подписка на Firebase
    useEffect(() => {
        const resultsRef = ref(db, 'live_results');

        const unsubscribe = onValue(
            resultsRef,
            (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    if (Array.isArray(data)) {
                        setApiResults(data);
                    } else {
                        const parsedArray = Object.values(data) as Group[];
                        setApiResults(parsedArray);
                    }
                    setApiError(null);
                }
            },
            (error) => {
                console.error("Firebase Error:", error);
                setApiError("Ошибка соединения с Firebase");
            }
        );

        return () => unsubscribe();
    }, []);

    // Identify latest finished athlete (Защищено от undefined)
    const latestFinisher = useMemo(() => {
        let participant: Participant | null = null;
        let groupName = "";

        for (const group of apiResults) {
            const finishers = group.finishers || [];
            const dnfs = group.dnfs || [];
            const dsqs = group.dsqs || [];
            const dnss = group.dnss || [];

            const latestInGroup = [...finishers, ...dnfs, ...dsqs, ...dnss].find(
                p => p.isLatest || (p as any).latest
            );
            if (latestInGroup) {
                participant = latestInGroup;
                groupName = `${group.title} | ${group.category}`;
                break;
            }
        }
        return { participant, groupName };
    }, [apiResults]);

    // Clean and localize group headers
    const formatGroupTitle = useCallback((title: string, category: string) => {
        let cleanCategory = category.replace(/[\*\`\(\)]/g, "").trim();
        let genderLabel = "";

        if (cleanCategory.toUpperCase().includes("MALE")) {
            cleanCategory = cleanCategory.replace(/MALE/gi, "").trim();
            genderLabel = "ЮНОШИ";
        } else if (cleanCategory.toUpperCase().includes("FEMALE")) {
            cleanCategory = cleanCategory.replace(/FEMALE/gi, "").trim();
            genderLabel = "ДЕВУШКИ";
        } else if (cleanCategory.toUpperCase().includes("ЮНОШИ")) {
            cleanCategory = cleanCategory.replace(/ЮНОШИ/gi, "").trim();
            genderLabel = "ЮНОШИ";
        } else if (cleanCategory.toUpperCase().includes("ДЕВУШКИ")) {
            cleanCategory = cleanCategory.replace(/ДЕВУШКИ/gi, "").trim();
            genderLabel = "ДЕВУШКИ";
        }

        const cleanTitle = title.replace(/[\*\`🏆]/g, "").trim();
        return genderLabel ? `${cleanTitle} | Группа ${cleanCategory} ${genderLabel}` : `${cleanTitle} | Группа ${cleanCategory}`;
    }, []);

    // Filter groups
    const filteredGroups = useMemo(() => {
        return apiResults
            .filter(g => {
                const titleCategory = formatGroupTitle(g.title, g.category);
                const categoryMatches = filterCategory === "ВСЕ" || titleCategory.includes(filterCategory);
                const genderMatches = filterGender === "ВСЕ" || titleCategory.includes(filterGender);
                return categoryMatches && genderMatches;
            })
            .sort((g1, g2) => {
                const cat1 = g1.category.toLowerCase();
                const cat2 = g2.category.toLowerCase();
                if (cat1 !== cat2) {
                    return cat1.localeCompare(cat2);
                }
                return g1.title.localeCompare(g2.title);
            });
    }, [apiResults, filterCategory, filterGender, formatGroupTitle]);

    // Extract unique categories for filter
    const categoriesFilterList = useMemo(() => {
        const cats = new Set<string>();
        apiResults.forEach(g => {
            const cleanCat = g.category
                .replace(/[\*\(\)]/g, "")
                .replace(/MALE|FEMALE|ЮНОШИ|ДЕВУШКИ/gi, "")
                .trim();
            if (cleanCat) {
                cats.add(cleanCat);
            }
        });
        return Array.from(cats).sort();
    }, [apiResults]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white/95 backdrop-blur-xs border-b border-slate-200/80 fixed top-0 left-0 right-0 z-50 shadow-xs px-2 md:px-4 py-2">
                <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-1.5 md:grid md:grid-cols-3 md:gap-4">
                    <div className="flex items-center justify-start shrink-0">
                        <a
                            href="https://snowfox-skiteam.ru/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-1.5 md:gap-3 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 hover:from-blue-100/70 hover:to-indigo-100/50 border border-blue-100 hover:border-blue-200 rounded-xl px-1.5 py-1 md:px-3 md:py-1.5 transition-all duration-300 active:scale-95 shadow-2xs hover:shadow-sm"
                            title="Перейти на сайт школы Снежные Лисы"
                        >
                            <img
                                src={snowfoxLogo}
                                alt="Снежные Лисы"
                                className="h-8 w-8 md:h-11 md:w-11 object-contain rounded-full shadow-xs border border-blue-200/60 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300"
                                referrerPolicy="no-referrer"
                            />
                            <div className="flex flex-col min-w-0">
                                <div className="hidden md:flex flex-col">
                                    <div className="flex items-center gap-1">
                                        <span className="font-extrabold text-xs text-blue-900 tracking-tight leading-none uppercase">
                                            СНЕЖНЫЕ ЛИСЫ
                                        </span>
                                        <span className="inline-flex items-center justify-center bg-blue-600 text-white text-[8px] font-black uppercase px-1 py-0.5 rounded-sm tracking-wider leading-none group-hover:bg-blue-700 transition-colors shrink-0">
                                            Сайт ↗
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-blue-700 font-extrabold leading-tight mt-0.5 whitespace-nowrap tracking-wide uppercase">
                                        УЧИМ КАТАТЬСЯ ПРАВИЛЬНО
                                    </span>
                                    <span className="text-[8.5px] text-indigo-500 font-bold leading-none mt-0.5 flex items-center gap-0.5 group-hover:text-indigo-600 transition-colors">
                                        УЗНАТЬ СЕКРЕТЫ ТЕХНИКИ
                                        <ArrowUpRight className="w-2.5 h-2.5 translate-y-px group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </span>
                                </div>

                                <div className="flex md:hidden flex-col">
                                    <div className="flex items-center gap-1">
                                        <span className="font-extrabold text-[8px] text-blue-900 tracking-tight leading-none uppercase">
                                            ГОРНОЛЫЖНЫЙ КЛУБ
                                        </span>
                                        <span className="inline-flex items-center justify-center bg-blue-600 text-white text-[5px] font-black uppercase px-0.5 py-0.5 rounded-xs tracking-wider leading-none shrink-0">
                                            Сайт ↗
                                        </span>
                                    </div>
                                    <span className="text-[7.5px] text-blue-700 font-extrabold leading-tight mt-0.5 whitespace-nowrap tracking-wide uppercase flex items-center gap-0.5">
                                        УЗНАТЬ СЕКРЕТЫ ТЕХНИКИ
                                        <ArrowUpRight className="w-2 h-2 shrink-0 text-blue-700 animate-pulse" />
                                    </span>
                                </div>
                            </div>
                        </a>
                    </div>

                    <div className="hidden md:flex items-center justify-center md:text-center">
                        <h1 className="text-sm md:text-lg font-black text-slate-900 tracking-tight uppercase">
                            Онлайн результаты
                        </h1>
                    </div>

                    <div className="flex items-center justify-end">
                        <div className={`flex items-center gap-1 md:gap-2 border rounded-md md:rounded-xl px-1.5 py-0.5 md:px-3 md:py-1.5 text-[10px] md:text-xs font-mono transition-colors ${apiError
                                ? "bg-rose-50 border-rose-200 text-rose-600"
                                : "bg-slate-50 border-slate-200 text-slate-600"
                            }`}>
                            <Clock className={`w-3 h-3 md:w-3.5 md:h-3.5 ${apiError ? "text-rose-500 animate-pulse" : "text-blue-500"}`} />
                            <span>{currentTime.toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="h-[54px] md:h-[76px] shrink-0" />

            <main className="flex-1 max-w-7xl w-full mx-auto p-2 md:p-6 lg:p-8 flex flex-col gap-3 md:gap-6">
                <div className="flex flex-col gap-3 md:gap-6">
                    {/* Highlight Latest Finisher Card */}
                    {latestFinisher.participant ? (
                        <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-xs md:shadow-md p-3 md:p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-full bg-blue-50/30 blur-3xl rounded-full pointer-events-none" />
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-5 relative z-10">
                                <div className="flex items-center gap-2.5 md:gap-4">
                                    <div className="relative shrink-0">
                                        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                                        </span>
                                        <div className="bg-blue-50 border border-blue-200 text-blue-600 rounded-xl md:rounded-2xl h-11 w-11 md:h-16 md:w-16 flex items-center justify-center font-mono font-black text-lg md:text-2xl shadow-xs">
                                            №{latestFinisher.participant.bib}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-0.5 md:gap-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] md:text-[10px] tracking-wider uppercase font-black text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md">
                                                ПОСЛЕДНЕЕ СОБЫТИЕ
                                            </span>
                                        </div>
                                        <h2 className="text-sm md:text-2xl font-black text-slate-900 tracking-tight uppercase truncate">
                                            {latestFinisher.participant.name}
                                        </h2>
                                        <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate">
                                            Группа {formatGroupTitle("", latestFinisher.groupName).replace("| Группа", "").trim()}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 border border-slate-200/80 rounded-xl md:rounded-2xl px-3 py-1.5 md:px-5 md:py-3 w-full sm:w-auto sm:min-w-[160px] flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                                    <span className="text-[9px] md:text-[10px] tracking-widest uppercase font-extrabold text-slate-400 mb-0 sm:mb-0.5">
                                        {latestFinisher.participant.status === "FINISHED" ? "РЕЗУЛЬТАТ" : "СТАТУС"}
                                    </span>
                                    {latestFinisher.participant.status === "FINISHED" ? (
                                        (() => {
                                            const { mainTime, sumStr } = getDisplayTimes(latestFinisher.participant.resultDetails);
                                            return (
                                                <div className="flex flex-col items-end sm:items-end">
                                                    <span className="text-xl md:text-3xl font-black font-mono text-blue-600 leading-none">
                                                        {mainTime}
                                                    </span>
                                                    {sumStr ? (
                                                        <span className="text-[10px] md:text-xs text-slate-500 font-bold mt-0 sm:mt-1.5 bg-white px-1.5 py-0.5 rounded-md md:rounded-lg border border-slate-200">
                                                            {sumStr}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] md:text-[10px] text-slate-400 font-medium mt-0 sm:mt-1">
                                                            {latestFinisher.participant.resultDetails}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <span
                                            className={`text-lg md:text-2xl font-black font-mono leading-none ${latestFinisher.participant.status === "DNF"
                                                    ? "text-red-500"
                                                    : latestFinisher.participant.status === "DSQ"
                                                        ? "text-orange-500"
                                                        : "text-slate-500"
                                                }`}
                                        >
                                            {latestFinisher.participant.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl md:rounded-3xl p-4 md:p-6 text-center text-slate-400 text-xs md:text-sm font-medium">
                            Ожидаем первых финишей спортсменов...
                        </div>
                    )}

                    {/* Filtering Controls */}
                    <div className="bg-white rounded-xl md:rounded-2xl border border-slate-200/80 p-2.5 md:p-4 shadow-xs flex flex-wrap items-center justify-between gap-2.5 md:gap-4">
                        <div className="flex items-center gap-1.5 md:gap-2">
                            <SlidersVertical className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" />
                            <span className="text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Фильтры табло:</span>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <div className="flex items-center gap-1 flex-1 sm:flex-initial">
                                <span className="text-[10px] md:text-xs text-slate-400 font-medium shrink-0">Группа:</span>
                                <select
                                    value={filterCategory}
                                    onChange={e => setFilterCategory(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl px-2 py-1 md:px-2.5 md:py-1.5 text-[11px] md:text-xs font-bold text-slate-700 outline-hidden focus:border-blue-500 transition-all cursor-pointer w-full"
                                >
                                    <option value="ВСЕ">Все возраста</option>
                                    {categoriesFilterList.map(cat => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-1 flex-1 sm:flex-initial">
                                <span className="text-[10px] md:text-xs text-slate-400 font-medium shrink-0">Пол:</span>
                                <select
                                    value={filterGender}
                                    onChange={e => setFilterGender(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-lg md:rounded-xl px-2 py-1 md:px-2.5 md:py-1.5 text-[11px] md:text-xs font-bold text-slate-700 outline-hidden focus:border-blue-500 transition-all cursor-pointer w-full"
                                >
                                    <option value="ВСЕ">Все полы</option>
                                    <option value="ЮНОШИ">ЮНОШИ (MALE)</option>
                                    <option value="ДЕВУШКИ">ДЕВУШКИ (FEMALE)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Results Cards Board */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredGroups.map(g => {
                                const finishers = g.finishers || [];
                                const dnfs = g.dnfs || [];
                                const dsqs = g.dsqs || [];
                                const dnss = g.dnss || [];
                                const totalCount = finishers.length + dnfs.length + dsqs.length + dnss.length;

                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                        key={`${g.title}_${g.category}`}
                                        className="bg-white rounded-xl md:rounded-3xl border border-slate-200/80 shadow-xs md:shadow-md overflow-hidden flex flex-col"
                                    >
                                        {/* Group Header */}
                                        <div className="bg-slate-50/50 border-b border-slate-100 px-3 py-2 md:px-6 md:py-4 flex justify-between items-center gap-2">
                                            <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
                                                <Award className="w-4 h-4 md:w-5 md:h-5 text-blue-600 shrink-0" />
                                                <h3 className="font-extrabold text-slate-800 tracking-tight text-xs md:text-sm uppercase truncate">
                                                    {formatGroupTitle(g.title, g.category)}
                                                </h3>
                                            </div>
                                            <span className="text-[9px] md:text-[10px] bg-slate-200/60 text-slate-600 font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                                                🏁 {totalCount} уч.
                                            </span>
                                        </div>

                                        {/* Group Body */}
                                        <div className="p-2 md:p-4 flex-1 flex flex-col gap-1 md:gap-1.5">
                                            {totalCount === 0 ? (
                                                <div className="py-6 md:py-8 text-center text-slate-400 text-[11px] md:text-xs font-medium">
                                                    Нет зарегистрированных заездов в этой группе
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Finishers */}
                                                    {finishers.map(f => {
                                                        const isLatest = f.isLatest || (f as any).latest;
                                                        return (
                                                            <div
                                                                key={f.bib}
                                                                onClick={() => setSelectedAthlete({ athlete: f, groupTitle: formatGroupTitle(g.title, g.category) })}
                                                                className={`flex items-center justify-between p-2 md:p-3 rounded-xl md:rounded-2xl border transition-all cursor-pointer hover:border-blue-300 hover:shadow-sm active:scale-[0.99] group/row ${isLatest
                                                                        ? "bg-blue-50/70 border-blue-200/60 shadow-xs ring-1 ring-blue-500/10"
                                                                        : "bg-white border-slate-100 hover:border-slate-200"
                                                                    }`}
                                                                title="Нажмите, чтобы посмотреть подробную информацию"
                                                            >
                                                                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                                                                    <div
                                                                        className={`w-5.5 h-5.5 md:w-6 md:h-6 rounded-md md:rounded-lg flex items-center justify-center font-bold text-[10px] md:text-xs shrink-0 ${f.rank === "1"
                                                                                ? "bg-amber-100 text-amber-700 font-black"
                                                                                : f.rank === "2"
                                                                                    ? "bg-slate-100 text-slate-600 font-extrabold"
                                                                                    : f.rank === "3"
                                                                                        ? "bg-amber-500/10 text-amber-800"
                                                                                        : "text-slate-400 font-mono"
                                                                            }`}
                                                                    >
                                                                        {f.rank}
                                                                    </div>
                                                                    <div className="bg-slate-100 border border-slate-200/50 rounded-md md:rounded-lg h-6 w-6 md:h-7 md:w-7 flex items-center justify-center text-[10px] md:text-xs font-mono font-black text-slate-700 shrink-0">
                                                                        {f.bib}
                                                                    </div>
                                                                    <span
                                                                        className={`text-[11px] md:text-xs uppercase truncate group-hover/row:text-blue-600 transition-colors ${isLatest ? "font-bold text-blue-950" : "font-semibold text-slate-700"
                                                                            }`}
                                                                    >
                                                                        {f.name}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                                                                    <span
                                                                        className={`text-[10px] md:text-xs font-mono font-bold px-1.5 py-0.5 rounded-md md:rounded-lg transition-colors group-hover/row:bg-blue-100 group-hover/row:text-blue-700 ${isLatest
                                                                                ? "bg-blue-600 text-white shadow-xs"
                                                                                : "bg-slate-50 text-slate-600 border border-slate-100"
                                                                            }`}
                                                                    >
                                                                        {f.resultDetails}
                                                                    </span>
                                                                    {isLatest && (
                                                                        <span className="flex h-1.5 w-1.5 md:h-2 md:w-2 relative shrink-0">
                                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-blue-600" />
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}

                                                    {/* DNFs, DSQs, DNSs */}
                                                    {[...dnfs, ...dsqs, ...dnss].map(e => {
                                                        const isLatest = e.isLatest || (e as any).latest;
                                                        return (
                                                            <div
                                                                key={e.bib}
                                                                onClick={() => setSelectedAthlete({ athlete: e, groupTitle: formatGroupTitle(g.title, g.category) })}
                                                                className={`flex items-center justify-between p-2 md:p-3 rounded-xl md:rounded-2xl border transition-all cursor-pointer hover:border-slate-300 hover:shadow-sm active:scale-[0.99] group/row ${isLatest
                                                                        ? "bg-red-50/70 border-red-200/60 shadow-xs ring-1 ring-red-500/10"
                                                                        : "bg-slate-50/50 border-slate-100/60 opacity-80"
                                                                    }`}
                                                                title="Нажмите, чтобы посмотреть подробную информацию"
                                                            >
                                                                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                                                                    <div className="w-5.5 h-5.5 md:w-6 md:h-6 rounded-md md:rounded-lg flex items-center justify-center text-slate-300 font-mono text-[10px] md:text-xs shrink-0">
                                                                        —
                                                                    </div>
                                                                    <div className="bg-slate-100 border border-slate-200/50 rounded-md md:rounded-lg h-6 w-6 md:h-7 md:w-7 flex items-center justify-center text-[10px] md:text-xs font-mono font-black text-slate-500 shrink-0">
                                                                        {e.bib}
                                                                    </div>
                                                                    <span className="text-[11px] md:text-xs font-medium text-slate-500 uppercase truncate group-hover/row:text-slate-800 transition-colors">
                                                                        {e.name}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                                                                    <span
                                                                        className={`text-[10px] md:text-xs font-mono font-black px-1.5 py-0.5 rounded-md md:rounded-lg border transition-colors group-hover/row:bg-slate-100 ${e.status === "DNF"
                                                                                ? "bg-red-50 text-red-600 border-red-100"
                                                                                : e.status === "DSQ"
                                                                                    ? "bg-orange-50 text-orange-600 border-orange-100"
                                                                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                                                            }`}
                                                                    >
                                                                        {e.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 py-6 px-4 mt-auto">
                <div className="max-w-7xl mx-auto flex justify-center items-center text-xs text-slate-400 font-semibold tracking-wide">
                    <p>© 2026 Лайв Тайминг</p>
                </div>
            </footer>

            {/* Participant Detail Modal */}
            <AnimatePresence>
                {selectedAthlete && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedAthlete(null)}
                        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden relative flex flex-col my-auto"
                        >
                            <div className={`p-6 text-white relative ${selectedAthlete.athlete.status !== "FINISHED"
                                    ? selectedAthlete.athlete.status === "DNF"
                                        ? "bg-gradient-to-r from-red-600 to-rose-700"
                                        : selectedAthlete.athlete.status === "DSQ"
                                            ? "bg-gradient-to-r from-orange-500 to-amber-600"
                                            : "bg-gradient-to-r from-slate-500 to-zinc-600"
                                    : selectedAthlete.athlete.rank === "1"
                                        ? "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600"
                                        : selectedAthlete.athlete.rank === "2"
                                            ? "bg-gradient-to-r from-slate-400 to-slate-500"
                                            : selectedAthlete.athlete.rank === "3"
                                                ? "bg-gradient-to-r from-amber-700 to-amber-800"
                                                : "bg-gradient-to-r from-blue-600 to-indigo-600"
                                }`}>
                                <button
                                    onClick={() => setSelectedAthlete(null)}
                                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/35 active:scale-90 transition-all rounded-full p-1.5 text-white outline-hidden cursor-pointer"
                                    aria-label="Закрыть"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-2 mb-2">
                                    {selectedAthlete.athlete.status === "FINISHED" ? (
                                        <div className="bg-white/25 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center gap-1.5">
                                            <Award className="w-3.5 h-3.5" />
                                            {selectedAthlete.athlete.rank} МЕСТО
                                        </div>
                                    ) : (
                                        <div className="bg-white/25 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase">
                                            СТАТУС: {selectedAthlete.athlete.status}
                                        </div>
                                    )}

                                    {selectedAthlete.athlete.isLatest && (
                                        <div className="bg-emerald-500 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase animate-pulse">
                                            НОВЫЙ ФИНИШ 🏁
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-baseline gap-2 mt-4">
                                    <span className="text-xs font-medium opacity-85 uppercase tracking-wider">Стартовый номер:</span>
                                    <span className="text-4xl font-black font-mono tracking-tight">{selectedAthlete.athlete.bib}</span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col gap-5">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Спортсмен</span>
                                    <h4 className="text-xl md:text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight break-words">
                                        {selectedAthlete.athlete.name}
                                    </h4>
                                </div>

                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Дисциплина / Группа</span>
                                    <p className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wide leading-relaxed">
                                        {selectedAthlete.groupTitle}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Timer className="w-4 h-4 text-slate-400" />
                                        Результаты заездов
                                    </span>

                                    {(() => {
                                        const runs = parseRuns(selectedAthlete.athlete.resultDetails);
                                        if (selectedAthlete.athlete.status !== "FINISHED") {
                                            return (
                                                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center">
                                                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Результат</span>
                                                    <span className="text-3xl font-black font-mono text-rose-600 block mt-1">
                                                        {selectedAthlete.athlete.status}
                                                    </span>
                                                    <span className="text-xs font-semibold text-rose-400 block mt-1">
                                                        {selectedAthlete.athlete.status === "DNF"
                                                            ? "Не финишировал (Did Not Finish)"
                                                            : selectedAthlete.athlete.status === "DSQ"
                                                                ? "Дисквалифицирован (Disqualified)"
                                                                : "Не стартовал (Did Not Start)"}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        if (!runs) {
                                            return (
                                                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center">
                                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Время заезда</span>
                                                    <span className="text-3xl font-black font-mono text-slate-800 block mt-1">
                                                        {selectedAthlete.athlete.resultDetails}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        if (runs.isSum) {
                                            return (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex flex-col justify-between">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">1-й заезд</span>
                                                        <span className="text-2xl font-black font-mono text-slate-800 mt-2">{runs.run1} с</span>
                                                    </div>
                                                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 flex flex-col justify-between">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">2-й заезд</span>
                                                        <span className="text-2xl font-black font-mono text-slate-800 mt-2">{runs.run2} с</span>
                                                    </div>
                                                    <div className="col-span-2 bg-blue-50/50 border border-blue-100/70 rounded-2xl p-4 flex justify-between items-center">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Сумма времени</span>
                                                            <span className="text-xs font-medium text-slate-400 mt-0.5">По сумме двух заездов</span>
                                                        </div>
                                                        <span className="text-3xl font-black font-mono text-blue-700">{runs.total} с</span>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="bg-blue-50/40 border border-blue-100/50 rounded-2xl p-4 flex justify-between items-center">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Время заезда</span>
                                                        <span className="text-xs font-medium text-slate-400 mt-0.5">Одиночный заезд</span>
                                                    </div>
                                                    <span className="text-3xl font-black font-mono text-blue-700">{runs.run1} с</span>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>

                                <button
                                    onClick={() => setSelectedAthlete(null)}
                                    className="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-2xl transition-all duration-300 active:scale-98 text-xs md:text-sm uppercase tracking-wider shadow-sm hover:shadow-md cursor-pointer"
                                >
                                    Вернуться к табло
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}