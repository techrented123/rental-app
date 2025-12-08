"use client";

import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Search } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { fetchRentReportsAction, RentReport } from "@/app/actions/rent-reports";

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div></div></td>
          <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
          <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div></td>
          <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div></td>
          <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div></td>
          <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
          <td className="px-6 py-4 whitespace-nowrap"><div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div></td>
        </tr>
      ))}
    </>
  );
}

export default function Page() {
  const [reports, setReports] = useState<RentReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [reportStatus, setReportStatus] = useState<"all" | "reported" | "not-reported">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [summaryStats, setSummaryStats] = useState({ totalUsers: 0, totalReportsThisMonth: 0 });

  const fetchRentReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetchRentReportsAction({
        page: currentPage,
        pageSize,
        month: selectedMonth,
        search: searchTerm,
        status: reportStatus,
      });

      if (result.success && result.data) {
        setReports(result.data.reports);
        setTotalPages(result.data.pagination.totalPages);
        setTotalCount(result.data.pagination.totalCount);
        
        if (result.data.stats) {
          setSummaryStats(result.data.stats);
        } else {
           // Fallback if stats not returned (should not happen with new action)
           const uniqueUsers = new Set(result.data.reports.map((r) => r.userSub));
           setSummaryStats({
             totalUsers: uniqueUsers.size,
             totalReportsThisMonth: result.data.reports.filter(r => r.status === "Reported").length
           });
        }
      } else {
        setReports([]);
      }
    } catch (e) {
      console.error("Failed to fetch reports", e);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, selectedMonth, searchTerm, reportStatus]);

  useEffect(() => {
    fetchRentReports();
  }, [fetchRentReports]);

  const handleRefresh = () => { fetchRentReports(); };
  const handleMonthChange = (month: string) => { setSelectedMonth(month); setCurrentPage(1); };
  const handleSearchChange = (term: string) => { setSearchTerm(term); setCurrentPage(1); };

  const handlePageChange = (page: number) => setCurrentPage(page);

  // Generate month options from May 2025 to Current Month (Dec 2025)
  const getMonthOptions = () => {
    const options = [];
    const startDate = new Date(2025, 4, 1); // May 2025 (Month is 0-indexed)
    const currentDate = new Date(); // Should be Dec 2025 per metadata
    
    let d = new Date(currentDate);
    // Ensure we don't go past the start date
    while (d >= startDate) {
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      const value = `${year}-${month.toString().padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      options.push({ value, label });
      d.setMonth(d.getMonth() - 1);
    }
    return options;
  };

  const getStatusIcon = (status: string) => status === "Reported" ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />;
  const getStatusColor = (status: string) => status === "Reported" ? "text-green-600 bg-green-100 dark:bg-green-900/30" : "text-red-600 bg-red-100 dark:bg-red-900/30";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rent Reports Tracking</h1>
            <p className="text-gray-600 dark:text-gray-400">Monitor user rent reporting compliance</p>
          </div>
          <div className="flex space-x-2"><Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700 text-white">Refresh Data</Button></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title=""><div className="p-6"><div className="flex items-center"><div className="flex-shrink-0"><div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"><svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg></div></div><div className="ml-4"><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Users</h3><p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{summaryStats.totalUsers}</p></div></div></div></Card>
          <Card title=""><div className="p-6"><div className="flex items-center"><div className="flex-shrink-0"><div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center"><svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div></div><div className="ml-4"><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reports This Month</h3><p className="text-3xl font-bold text-green-600 dark:text-green-400">{summaryStats.totalReportsThisMonth}</p><p className="text-sm text-gray-500 dark:text-gray-400">Current month: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p></div></div></div></Card>
        </div>
        
        <Card title="">
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center space-x-6"><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rent Reports</h3></div>
            
            <div className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search by name, email, phone, location..." 
                  value={searchTerm} 
                  onChange={(e) => handleSearchChange(e.target.value)} 
                  className="pl-10" 
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
              <div className="min-w-[200px] w-full md:w-auto">
                <select 
                  value={selectedMonth} 
                  onChange={(e) => handleMonthChange(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Months</option>
                  {getMonthOptions().map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button 
                  onClick={() => setReportStatus("all")}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${reportStatus === "all" ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400 hover:text-gray-900"}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setReportStatus("reported")}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${reportStatus === "reported" ? "bg-white dark:bg-gray-700 shadow-sm text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400 hover:text-gray-900"}`}
                >
                  Reported
                </button>
                <button 
                  onClick={() => setReportStatus("not-reported")}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${reportStatus === "not-reported" ? "bg-white dark:bg-gray-700 shadow-sm text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400 hover:text-gray-900"}`}
                >
                  Not Reported
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rent Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reported Date</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <TableSkeleton />
                ) : reports.length > 0 ? (
                  reports.map((report, index) => (
                    <tr key={report.createdAt || index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {report.firstName && report.lastName ? `${report.firstName} ${report.lastName}` : report.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-900 dark:text-white">{report.email || "—"}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{report.phone || "—"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {report.city && report.state ? `${report.city}, ${report.state}` : "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(report.status)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${report.rentAmount?.toLocaleString() || "0"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {report.paymentDate ? new Date(report.paymentDate).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No reports found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 sm:px-6 mt-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5) {
                        if (currentPage > 3) {
                          pageNum = currentPage - 2 + i;
                        }
                        if (pageNum > totalPages) {
                          pageNum = totalPages - 4 + i;
                        }
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNum ? 'bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
