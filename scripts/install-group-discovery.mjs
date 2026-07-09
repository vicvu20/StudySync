import fs from 'node:fs';
import path from 'node:path';

const pagePath = path.resolve('frontend/src/pages/GroupsPage.tsx');

if (!fs.existsSync(pagePath)) {
  console.error(`Could not find ${pagePath}. Run this script from the StudySync repository root.`);
  process.exit(1);
}

let source = fs.readFileSync(pagePath, 'utf8');

if (source.includes("../components/GroupDiscoveryFilters")) {
  console.log('Group Discovery is already installed. No changes made.');
  process.exit(0);
}

function replaceOnce(label, needle, replacement) {
  if (!source.includes(needle)) {
    console.error(`Installer could not find the expected ${label} anchor in GroupsPage.tsx.`);
    process.exit(1);
  }
  source = source.replace(needle, replacement);
}

replaceOnce(
  'GroupCard import',
  "import { GroupCard } from '../components/GroupCard';",
  "import { GroupCard } from '../components/GroupCard';\nimport { GroupDiscoveryFilters, type GroupFilterState } from '../components/GroupDiscoveryFilters';"
);

replaceOnce(
  'selected group state',
  "  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);",
  `  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);\n  const [filters, setFilters] = useState<GroupFilterState>({\n    query: '',\n    courseId: 'ALL',\n    meetingMode: 'ALL',\n    sortBy: 'DEFAULT'\n  });`
);

const filterLogic = `  const normalizedQuery = filters.query.trim().toLowerCase();\n  const filteredGroups = groups\n    .filter((group) => {\n      const searchableText = [\n        group.title,\n        group.description,\n        group.studyGoal,\n        group.location,\n        group.course.code,\n        group.course.title\n      ]\n        .filter(Boolean)\n        .join(' ')\n        .toLowerCase();\n\n      const matchesQuery = normalizedQuery === '' || searchableText.includes(normalizedQuery);\n      const matchesCourse = filters.courseId === 'ALL' || group.course.id === filters.courseId;\n      const matchesMode = filters.meetingMode === 'ALL' || group.meetingMode === filters.meetingMode;\n\n      return matchesQuery && matchesCourse && matchesMode;\n    })\n    .sort((a, b) => {\n      if (filters.sortBy === 'MOST_ACTIVE') {\n        return (b._count?.sessions ?? 0) - (a._count?.sessions ?? 0);\n      }\n      if (filters.sortBy === 'MOST_MEMBERS') {\n        return (b._count?.memberships ?? 0) - (a._count?.memberships ?? 0);\n      }\n      if (filters.sortBy === 'MOST_SPACE') {\n        const aSpace = a.maxMembers - (a._count?.memberships ?? 0);\n        const bSpace = b.maxMembers - (b._count?.memberships ?? 0);\n        return bSpace - aSpace;\n      }\n      if (filters.sortBy === 'TITLE') {\n        return a.title.localeCompare(b.title);\n      }\n      return 0;\n    });\n\n  function clearFilters() {\n    setFilters({ query: '', courseId: 'ALL', meetingMode: 'ALL', sortBy: 'DEFAULT' });\n  }\n\n`;

replaceOnce('return statement', '  return (', `${filterLogic}  return (`);

const groupGridPattern = /        <div className="group-grid">\n          \{groups\.map\(\(group\) => \(\n            <GroupCard[\s\S]*?          \)\)\}\n        <\/div>/;

if (!groupGridPattern.test(source)) {
  console.error('Installer could not find the current group-card grid in GroupsPage.tsx.');
  process.exit(1);
}

const discoveryUi = `        <GroupDiscoveryFilters\n          courses={courses}\n          filters={filters}\n          resultCount={filteredGroups.length}\n          totalCount={groups.length}\n          onChange={setFilters}\n          onClear={clearFilters}\n        />\n\n        {filteredGroups.length > 0 ? (\n          <div className="group-grid">\n            {filteredGroups.map((group) => (\n              <GroupCard\n                key={group.id}\n                group={group}\n                onJoin={joinGroup}\n                onSelect={setSelectedGroupId}\n                isSelected={group.id === selectedGroupId}\n              />\n            ))}\n          </div>\n        ) : (\n          <div className="card empty-state">\n            <h2>No study groups match those filters</h2>\n            <p className="muted">Try a different course, meeting mode, or search term.</p>\n            <button className="ghost" type="button" onClick={clearFilters}>\n              Show all groups\n            </button>\n          </div>\n        )}`;

source = source.replace(groupGridPattern, discoveryUi);
fs.writeFileSync(pagePath, source);
console.log('Installed Group Discovery search, filters, sorting, result count, and empty state.');
