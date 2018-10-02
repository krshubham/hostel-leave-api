export default interface ILeaveForm {
    apply: string;
    lvtype: "OG";
    sttime_hh: string;
    sttime_mm: string;
    endtime_hh: string;
    endtime_mm: string;
    place: string;
    reason: string;
    smobile: string;
    pmobile: string;
    advicer: string;
    facmobile: string;
    block: string;
    room: string;
    requestcmd: string;
    exitdate: string;
    frm_timetype: "AM" | "PM";
    to_timetype: "AM" | "PM";
}