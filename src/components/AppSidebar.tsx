import {
  LayoutDashboard, Users, Clock, CalendarDays, DollarSign,
  TrendingUp, Gift, AlertTriangle, ShieldAlert, LogOut
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Attendance", url: "/attendance", icon: Clock },
  { title: "Leave Management", url: "/leave", icon: CalendarDays },
];

const payrollNav = [
  { title: "Salary & Payroll", url: "/payroll", icon: DollarSign },
  { title: "Performance", url: "/performance", icon: TrendingUp },
  { title: "Bonus", url: "/bonus", icon: Gift },
  { title: "Penalty System", url: "/penalty", icon: AlertTriangle },
];

const systemNav = [
  { title: "Anomaly Detection", url: "/anomaly", icon: ShieldAlert },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const renderGroup = (label: string, items: typeof mainNav) => (
    <SidebarGroup key={label}>
      {!collapsed && <SidebarGroupLabel className="text-sidebar-foreground/50 uppercase text-[10px] tracking-widest font-semibold mb-1">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <NavLink
                  to={item.url}
                  end
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-primary-foreground hover:bg-sidebar-accent transition-all duration-200"
                  activeClassName="bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && <span className="text-sm">{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <DollarSign className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && <span className="font-bold text-base text-sidebar-primary-foreground tracking-tight">PayrollPro</span>}
      </div>
      <SidebarContent className="px-2 py-4 space-y-1">
        {renderGroup("Main", mainNav)}
        {renderGroup("Payroll", payrollNav)}
        {renderGroup("System", systemNav)}
      </SidebarContent>
      <SidebarFooter className="px-2 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink to="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/50 hover:text-destructive transition-colors">
                <LogOut className="h-[18px] w-[18px]" />
                {!collapsed && <span className="text-sm">Logout</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
