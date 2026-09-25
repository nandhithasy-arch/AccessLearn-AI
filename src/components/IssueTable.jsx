const SEVERITY_STYLES = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-amber-100 text-amber-800',
  low: 'bg-gray-100 text-gray-700',
  informational: 'bg-blue-100 text-blue-800',
}

/** issues: AccessibilityIssue[] from GET /documents/{id}/issues */
export default function IssueTable({ issues }) {
  if (!issues?.length) {
    return <p className="text-sm text-gray-500">No accessibility issues detected yet.</p>
  }
  return (
    <table className="w-full text-sm border-collapse">
      <caption className="sr-only">Detected accessibility issues</caption>
      <thead>
        <tr className="text-left border-b border-gray-200">
          <th scope="col" className="py-2 pr-4 font-medium text-gray-600">
            Element
          </th>
          <th scope="col" className="py-2 pr-4 font-medium text-gray-600">
            Issue
          </th>
          <th scope="col" className="py-2 pr-4 font-medium text-gray-600">
            Severity
          </th>
          <th scope="col" className="py-2 font-medium text-gray-600">
            Suggested action
          </th>
        </tr>
      </thead>
      <tbody>
        {issues.map((issue) => (
          <tr key={issue.id} className="border-b border-gray-100">
            <td className="py-2 pr-4 text-gray-700">{issue.element_id}</td>
            <td className="py-2 pr-4 text-gray-700">{issue.issue}</td>
            <td className="py-2 pr-4">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_STYLES[issue.severity]}`}>
                {issue.severity}
              </span>
            </td>
            <td className="py-2 text-gray-700">{issue.suggested_action}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
