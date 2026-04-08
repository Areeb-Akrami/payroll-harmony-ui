import { DashboardLayout } from "@/components/DashboardLayout";
import { Search, Plus, Filter, MoreHorizontal, RefreshCw, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { employeeService, Employee, CreateEmployee } from "@/services/employeeService";
import { initializeServices } from "@/services";

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({ id: "", name: "", role: "", salary: "", department: "", status: "Active", joinDate: "" });

  const fetchEmployees = () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = employeeService.getAllEmployees();
      setEmployees(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch employees');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initialize services on first load
    initializeServices();
    fetchEmployees();
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!editingEmployee) {
        const existingEmployee = employeeService.getAllEmployees().find(emp => emp.id === parseInt(formData.id));
        if (existingEmployee) {
          alert("Employee ID already exists. Please use a different ID.");
          return;
        }
      }

      const employeeData: CreateEmployee = {
        name: formData.name,
        role: formData.role,
        salary: parseFloat(formData.salary),
        department: formData.department,
        status: formData.status as 'Active' | 'On Leave' | 'Inactive',
        joinDate: formData.joinDate
      };

      if (editingEmployee) {
        employeeService.updateEmployee(editingEmployee.id, employeeData);
      } else {
        employeeService.createEmployee({ ...employeeData, id: parseInt(formData.id) });
      }
      
      fetchEmployees();
      closeModal();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save employee');
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        employeeService.deleteEmployee(id);
        fetchEmployees();
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to delete employee');
      }
    }
  };

  const openModal = (employee: Employee | null = null) => {
    setEditingEmployee(employee);
    setFormData(employee ? { id: employee.id?.toString() ?? '', name: employee.name, role: employee.role, salary: employee.salary?.toString() ?? '', department: employee.department || "", status: employee.status || "Active", joinDate: employee.joinDate || "" } : { id: "", name: "", role: "", salary: "", department: "", status: "Active", joinDate: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData({ id: "", name: "", role: "", salary: "", department: "", status: "Active", joinDate: "" });
  };

  const departments = ["All", ...[...new Set(employees.map((e) => e.department).filter(Boolean) as string[])].sort()];
  const filtered = employees.filter(
    (e) =>
      (filter === "All" || e.department === filter) &&
      (e.name.toLowerCase().includes(search.toLowerCase()) || 
        `EMP${e.id.toString().padStart(3, "0")}`.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-header">Employee Management</h1>
            <p className="page-subtitle">Manage your organization's workforce</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchEmployees} className="gap-2 h-10">
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={() => openModal()} className="gap-2 h-10">
              <Plus className="h-4 w-4" /> Add Employee
            </Button>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-muted/50 border-0"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {departments.map((d) => (
                <button
                  key={d}
                  onClick={() => setFilter(d!)}
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
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">Loading...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-red-500">Error: {error}</td>
                  </tr>
                ) : (
                  filtered.map((emp) => (
                    <tr key={emp.id}>
                      <td className="text-muted-foreground font-mono text-xs">EMP{(emp.id ?? '').toString().padStart(3, "0")}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                            {emp.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{emp.name}</p>
                            <p className="text-xs text-muted-foreground">{emp.email || "N/A"}</p>
                          </div>
                        </div>
                      </td>
                      <td>{emp.department || "N/A"}</td>
                      <td>{emp.role}</td>
                      <td className="font-medium">${emp.salary.toLocaleString()}</td>
                      <td>
                        <span className={emp.status === "Active" ? "badge-success" : emp.status === "On Leave" ? "badge-warning" : "badge-danger"}>
                          {emp.status || "N/A"}
                        </span>
                      </td>
                      <td className="text-muted-foreground">{emp.joinDate || "N/A"}</td>
                      <td>
                        <Button variant="ghost" size="icon" onClick={() => openModal(emp)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(emp.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-background p-8 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingEmployee ? "Edit Employee" : "Add New Employee"}</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input
                placeholder="Employee ID"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                required
                disabled={!!editingEmployee}
              />
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                placeholder="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />
              <Input
                placeholder="Salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                required
              />
              <Input
                placeholder="Department"
                value={formData.department || ""}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
              <Input
                placeholder="Joined Date"
                type="date"
                value={formData.joinDate || ""}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit">{editingEmployee ? "Save Changes" : "Add Employee"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Employees;