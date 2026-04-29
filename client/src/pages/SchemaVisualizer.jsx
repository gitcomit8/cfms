import { useEffect, useState } from 'react';
import { getSchema } from '../api/schema';

const SchemaVisualizer = () => {
  const [schema, setSchema] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedTables, setExpandedTables] = useState({});

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const response = await getSchema();
        setSchema(response.data);
        if (response.data.tables.length > 0) {
          setSelectedTable(response.data.tables[0].name);
          setExpandedTables({ [response.data.tables[0].name]: true });
        }
      } catch (err) {
        setError('Failed to load schema');
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, []);

  const toggleTableExpanded = (tableName) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-gray-500">Loading schema...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  if (!schema) {
    return <div className="text-gray-600 p-4">No schema data available</div>;
  }

  const selectedTableData = schema.tables.find(t => t.name === selectedTable);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Database Schema</h1>
          <p className="text-gray-600">
            Interactive visualization of the {schema.database} database structure
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tables List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                <h2 className="font-bold text-lg">Tables ({schema.tables.length})</h2>
              </div>
              <div className="divide-y max-h-[calc(100vh-200px)] overflow-y-auto">
                {schema.tables.map(table => (
                  <button
                    key={table.name}
                    onClick={() => setSelectedTable(table.name)}
                    className={`w-full text-left px-4 py-3 transition-all border-l-4 ${
                      selectedTable === table.name
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-semibold'
                        : 'border-transparent text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm">{table.name}</span>
                      <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                        {table.columns.length}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {selectedTableData && (
              <>
                {/* Table Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
                    <h3 className="text-2xl font-bold font-mono mb-2">{selectedTableData.name}</h3>
                    <p className="text-purple-100 text-sm">
                      {selectedTableData.columns.length} columns • {selectedTableData.primaryKey.length} primary key(s) • {selectedTableData.foreignKeys.length} foreign key(s)
                    </p>
                  </div>

                  {/* Columns Section */}
                  <div className="p-6">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                      <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                      Columns
                    </h4>
                    <div className="space-y-2">
                      {selectedTableData.columns.map(column => (
                        <div
                          key={column.name}
                          className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <code className="font-mono font-semibold text-gray-900 text-sm break-all">
                                {column.name}
                              </code>
                              <div className="flex gap-1">
                                {column.isPrimary && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    🔑 PK
                                  </span>
                                )}
                                {column.isUnique && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                                    ✓ UNI
                                  </span>
                                )}
                                {column.isIndex && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    📇 IDX
                                  </span>
                                )}
                                {!column.nullable && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    NOT NULL
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-600">
                              <span className="font-mono bg-white px-2 py-1 rounded border border-gray-300">
                                {column.type}
                              </span>
                              {column.default && (
                                <span className="ml-2 text-gray-500">
                                  default: <code>{column.default}</code>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Foreign Keys Section */}
                  {selectedTableData.foreignKeys.length > 0 && (
                    <div className="border-t border-gray-200 p-6">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                        Foreign Keys
                      </h4>
                      <div className="space-y-3">
                        {selectedTableData.foreignKeys.map((fk, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-indigo-50 rounded-lg border border-indigo-200"
                          >
                            <div className="font-mono text-sm text-gray-900 font-semibold mb-1">
                              {fk.column} → {fk.referencedTable}({fk.referencedColumn})
                            </div>
                            <div className="text-xs text-gray-600">
                              <span className="text-gray-500">Constraint: </span>
                              <code className="font-mono text-gray-700">{fk.constraintName}</code>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats Footer */}
                  <div className="border-t border-gray-200 bg-gray-50 p-4 grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <p className="text-gray-600">Columns</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {selectedTableData.columns.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Keys</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {selectedTableData.primaryKey.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Relations</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {selectedTableData.foreignKeys.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ER Diagram Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">🔗 Relationships</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    {selectedTableData.foreignKeys.length === 0 ? (
                      <p>This table has no foreign key relationships.</p>
                    ) : (
                      <>
                        <p>This table references:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          {selectedTableData.foreignKeys.map((fk, idx) => (
                            <li key={idx}>
                              <span className="font-mono">{fk.referencedTable}</span>
                              {' '}via{' '}
                              <span className="font-mono text-blue-600">{fk.column}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                🔑 PK
              </span>
              <span className="text-gray-600">Primary Key</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                ✓ UNI
              </span>
              <span className="text-gray-600">Unique</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                📇 IDX
              </span>
              <span className="text-gray-600">Index</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                NOT NULL
              </span>
              <span className="text-gray-600">Required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemaVisualizer;
