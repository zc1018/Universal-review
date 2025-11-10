import React from 'react';

interface ResultDisplayProps {
  report: string;
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');

  const renderTable = (tableLines: string[]) => {
    if (tableLines.length < 2) return null; // Header and separator line needed
    const headerLine = tableLines[0];
    const headers = headerLine.split('|').map(h => h.trim()).filter(Boolean);
    const rows = tableLines.slice(2);

    return (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full divide-y divide-slate-200 border border-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {headers.map((header, i) => (
                <th key={i} scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {rows.map((rowLine, rowIndex) => {
              if (!rowLine.trim().startsWith('|')) return null;
              const cells = rowLine.split('|').map(c => c.trim()).filter(Boolean);
              return (
                <tr key={rowIndex}>
                  {cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4 whitespace-pre-wrap text-sm text-slate-600">
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // FIX: Change JSX.Element to React.ReactElement to resolve namespace error.
  const renderedElements: React.ReactElement[] = [];
  let currentTable: string[] | null = null;
  // FIX: Refactor code block parsing logic for correctness.
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  lines.forEach((line, index) => {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        renderedElements.push(
          <pre key={`codeblock-${index}`} className="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto my-4 text-sm">
            <code>{codeBlockLines.join('\n')}</code>
          </pre>
        );
        codeBlockLines = [];
      }
      inCodeBlock = !inCodeBlock;
      return;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }
    
    if (line.trim().startsWith('|')) {
      if (!currentTable) {
        currentTable = [];
      }
      currentTable.push(line);
    } else {
      if (currentTable) {
        // FIX: Ensure null is not pushed to the elements array.
        const table = renderTable(currentTable);
        if (table) {
          renderedElements.push(table);
        }
        currentTable = null;
      }

      if (line.startsWith('# ')) {
        renderedElements.push(<h1 key={index} className="text-3xl font-bold text-slate-900 mt-8 mb-4 pb-2 border-b-2 border-slate-200">{line.substring(2)}</h1>);
      } else if (line.startsWith('## ')) {
        renderedElements.push(<h2 key={index} className="text-2xl font-semibold text-slate-800 mt-6 mb-3 pb-1 border-b border-slate-200">{line.substring(3)}</h2>);
      } else if (line.startsWith('### ')) {
        renderedElements.push(<h3 key={index} className="text-xl font-semibold text-slate-700 mt-4 mb-2">{line.substring(4)}</h3>);
      } else if (line.startsWith('**') && line.endsWith('**')) {
        renderedElements.push(<p key={index} className="my-2 font-bold">{line.substring(2, line.length-2)}</p>);
      } else if (line.startsWith('* ')) {
        renderedElements.push(<li key={index} className="ml-5 list-disc text-slate-600">{line.substring(2)}</li>);
      } else if (line.trim() === '---') {
        renderedElements.push(<hr key={index} className="my-8 border-slate-200"/>);
      } else if (line.trim() !== '') {
        renderedElements.push(<p key={index} className="my-2 text-slate-600 leading-relaxed">{line}</p>);
      }
    }
  });

  if (currentTable) {
    const table = renderTable(currentTable);
    if (table) {
        renderedElements.push(table);
    }
  }

  return <div>{renderedElements}</div>;
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ report }) => {
  return (
    <div className="prose max-w-none p-6 bg-slate-50 rounded-xl border border-slate-200/80">
      <MarkdownRenderer content={report} />
    </div>
  );
};
