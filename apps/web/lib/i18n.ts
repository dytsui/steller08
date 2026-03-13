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
    profile: "我的档案",
    startCapture: "开始拍摄",
    uploadVideo: "上传视频",
    screenMode: "Screen Mode",
    viewHistory: "查看记录",
    trainingPlan: "训练计划",
    latestNews: "职业高尔夫新闻",
    noData: "暂无数据",
    login: "登录",
    register: "注册",
    logout: "退出",
    currentStudent: "当前学员",
    currentPortal: "当前门户",
    userLabel: "用户端",
    proLabel: "Pro端",
    proHome: "Pro工作台",
    proStudents: "我的学员",
    proInvites: "邀请绑定"
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
    profile: "Profile",
    startCapture: "Start Capture",
    uploadVideo: "Upload Video",
    screenMode: "Screen Mode",
    viewHistory: "History",
    trainingPlan: "Training",
    latestNews: "Pro golf news",
    noData: "No data",
    login: "Login",
    register: "Register",
    logout: "Logout",
    currentStudent: "Current player",
    currentPortal: "Portal",
    userLabel: "User",
    proLabel: "Pro",
    proHome: "Pro workspace",
    proStudents: "My students",
    proInvites: "Invites"
  }
} as const;

export function t(locale: Locale, key: keyof (typeof dictionaries)["zh-CN"]) {
  return dictionaries[locale][key] ?? dictionaries["zh-CN"][key];
}
