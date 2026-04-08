import { DashboardLayout } from "@/components/DashboardLayout";
import { Search, Plus, Filter, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const employees = [
  { id: "EMP001", name: "Sarah Chen", email: "sarah@company.com", dept: "Engineering", role: "Senior Developer", salary: "$8,500", status: "Active", joined: "Jan 2023" },
  { id: "EMP002", name: "Mike Johnson", email: "mike@company.com", dept: "Sales", role: "Sales Manager", salary: "$7,200", status: "Active", joined: "Mar 2022" },
  { id: "EMP003", name: "Emily Davis", email: "emily@company.com", dept: "Marketing", role: "Marketing Lead", salary: "$6,800", status: "Active", joined: "Jul 2023" },
  { id: "EMP004", name: "James Wilson", email: "james@company.com", dept: "Engineering", role: "DevOps Engineer", salary: "$9,100", status: "On Leave", joined: "Feb 2021" },
  { id: "EMP005", name: "Lisa Park", email: "lisa@company.com", dept: "HR", role: "HR Specialist", salary: "$5,900", status: "Active", joined: "Sep 2023" },
  { id: "EMP006", name: "David Brown", email: "david@company.com", dept: "Operations", role: "Operations Mgr", salary: "$7,800", status: "Active", joined: "Nov 2022" },
  { id: "EMP007", name: "Anna Lee", email: "anna@company.com", dept: "Engineering", role: "Frontend Dev", salary: "$7,500", status: "Inactive", joined: "May 2024" },
  { id: "EMP008", name: "Tom Harris", email: "tom@company.com", dept: "Sales", role: "Account Exec", salary: "$6,400", status: "Active", joined: "Aug 2023" },
];

const Employees = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const departments = ["All", ...new Set(employees.map((e) => e.dept))];

  const filtered = employees.filter((e) =>
    (filter === "All" || e.dept === filter) &&
    (e.name.toLowerCase().includes(search.toLowerCase()) || e.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-header">Employee Management</h1>
            <p className="page-subtitle">Manage your organization's workforce</p>
          </div>
          <Button className="gap-2 h-10">
            <Plus className="h-4 w-4" /> Add Employee
          </Button>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 bg-muted/50 border-0" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {departments.map((d) => (
                <button
                  key={d}
                  onClick={() => setFilter(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filter === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id}>
                    <td className="text-muted-foreground font-mono text-xs">{emp.id}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {emp.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{emp.dept}</td>
                    <td>{emp.role}</td>
                    <td className="font-medium">{emp.salary}</td>
                    <td>
                      <span className={emp.status === "Active" ? "badge-success" : emp.status === "On Leave" ? "badge-warning" : "badge-danger"}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="text-muted-foreground">{emp.joined}</td>
                    <td>
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Employees;
