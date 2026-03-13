import type { Locale } from "@/lib/types";

export const dictionaries = {
  "zh-CN": {
    appName: "Steller08 高尔夫 AI 教练",
    home: "首页",
    students: "学员",
    upload: "上传",
    capture: "拍摄",
    history: "记录",
    training: "训练",
    settings: "设置",
    startCapture: "开始拍摄",
    uploadVideo: "上传原视频",
    screenMode: "Screen Mode",
    viewHistory: "查看记录",
    trainingPlan: "训练计划",
    latestNews: "高尔夫中文新闻",
    noData: "暂无数据"
  },
  en: {
    appName: "Steller08 Golf AI Coach",
    home: "Home",
    students: "Students",
    upload: "Upload",
    capture: "Capture",
    history: "History",
    training: "Training",
    settings: "Settings",
    startCapture: "Start Capture",
    uploadVideo: "Upload Video",
    screenMode: "Screen Mode",
    viewHistory: "History",
    trainingPlan: "Training",
    latestNews: "Golf news in Chinese",
    noData: "No data"
  }
} as const;

export function t(locale: Locale, key: keyof (typeof dictionaries)["zh-CN"]) {
  return dictionaries[locale][key] ?? dictionaries["zh-CN"][key];
}
