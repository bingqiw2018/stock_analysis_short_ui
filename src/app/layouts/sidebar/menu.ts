import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 10000,
        label: 'MENUITEMS.OBSERVED_ANALYSIS.TEXT',
        isTitle: true
    },
    {
        id: 10001,
        label: 'MENUITEMS.NEW_OBSERVED.TEXT',
        icon: 'bx-import',
        link: '/observed/new',
    },
    {
        id: 10002,
        label: 'MENUITEMS.UP_OBSERVED.TEXT',
        icon: 'bx-trending-up',
        link: '/observed/up',
    },
    {
        id: 10003,
        label: 'MENUITEMS.DOWN_OBSERVED.TEXT',
        icon: 'bx-trending-down',
        link: '/observed/down',
    },   
    {
        id: 10003,
        label: 'MENUITEMS.CASH_FLOW.TEXT',
        icon: 'bx bx-dollar',
        link: '/observed/cashflow',
    },    
    {
        id: 10100,
        isLayout: true
    },
    {
        id: 30000,
        label: 'MENUITEMS.SHORT_ANALYSIS.TEXT',
        isTitle: true
    },
    {
        id: 30001,
        label: 'MENUITEMS.RATIO_DOWN_ANALYSIS.TEXT',
        icon: 'bxs-joystick-alt',
        link: '/short/ratio-down',
    },
    {
        id: 30002,
        label: 'MENUITEMS.AVG_LINE_LEVEL_ANALYSIS.TEXT',
        icon: 'bx bxs-hourglass',
        link: '/short/avg-line-level',
    },
    {
        id: 30003,
        label: 'MENUITEMS.BULL_ALIGNMENT.TEXT',
        icon: 'bx bxs-joystick',
        link: '/short/bull-alignment',
    },
    {
        id: 20000,
        label: 'MENUITEMS.TRADE_ANALYSIS.TEXT',
        isTitle: true
    },
    {
        id: 20001,
        label: 'MENUITEMS.TRADE_HOT.TEXT',
        icon: 'bxs-hot',
        link: '/observed/industry-hot',
    },
    {
        id: 20100,
        isLayout: true
    }
];

