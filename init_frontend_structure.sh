#!/bin/bash
create_file() {
  FILE_PATH=$1
  CONTENT=$2
  DIR_PATH=$(dirname "$FILE_PATH")
  if [ ! -d "$DIR_PATH" ]; then mkdir -p "$DIR_PATH"; echo "✅ 디렉터리 생성: $DIR_PATH"; fi
  if [ ! -f "$FILE_PATH" ]; then echo "$CONTENT" > "$FILE_PATH"; echo "✅ 파일 생성: $FILE_PATH"; else echo "☑️ 파일 이미 존재함: $FILE_PATH"; fi
}
echo "🚀 프로젝트 제네시스 프론트엔드 구조 동기화를 시작합니다..."
# Components (6개)
create_file "frontend/src/components/CompanyCard.jsx" 'import React from "react"; export default function CompanyCard({ company }) { return <div>{company.name}</div>; };'
create_file "frontend/src/components/ProjectCard.jsx" 'import React from "react"; export default function ProjectCard({ project }) { return <div>{project.project_name}</div>; };'
create_file "frontend/src/components/EmployeeCard.jsx" 'import React from "react"; export default function EmployeeCard({ employee }) { return <div>{employee.name}</div>; };'
create_file "frontend/src/components/LicenseCard.jsx" 'import React from "react"; export default function LicenseCard({ license }) { return <div>{license.name}</div>; };'
create_file "frontend/src/components/PageTitle.jsx" 'import React from "react"; export default function PageTitle({ title, children }) { return <h1>{title}</h1>; };'
# Pages (11개) - 주요 목록/상세 페이지 뼈대
create_file "frontend/src/pages/CompanyDetail.jsx" 'import React from "react"; export default function CompanyDetail() { return <div>Company Detail</div>; };'
create_file "frontend/src/pages/EmployeeList.jsx" 'import React from "react"; export default function EmployeeList() { return <div>Employee List</div>; };'
create_file "frontend/src/pages/EmployeeDetail.jsx" 'import React from "react"; export default function EmployeeDetail() { return <div>Employee Detail</div>; };'
create_file "frontend/src/pages/LicenseList.jsx" 'import React from "react"; export default function LicenseList() { return <div>License List</div>; };'
create_file "frontend/src/pages/LicenseDetail.jsx" 'import React from "react"; export default function LicenseDetail() { return <div>License Detail</div>; };'
# ... 기타 Placeholder 페이지들 ...
echo "✅ 동기화 완료!"