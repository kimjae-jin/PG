import os
import pandas as pd
import json

# --- 설정 ---
SOURCE_FOLDER = "data_migration/invoices_source"
OUTPUT_FILE = "data_migration/invoices_master.json"

# [수정] 최종 정찰 결과를 바탕으로 실제 헤더 위치와 컬럼명을 100% 동기화
SHEET_CONFIG = {
    'tax_invoice': {
        'sheet_name': '세금계산서',
        'header_row': 5, # 6번째 행
        'columns': {
            '승인번호': 'approval_no',
            '공급받는자사업자등록번호': 'client_reg_no',
            '상호': 'client_name',
            '작성일자': 'issue_date',
            '합계금액': 'total_amount',
        }
    },
    'items': {
        'sheet_name': '품목',
        'header_row': 4, # 5번째 행
        'columns': {
            '승인번호': 'approval_no',
            '일자': 'item_date',
            '품목명': 'item_name',
            '공급가액': 'supply_amount',
            '세액': 'tax_amount',
        }
    }
}

def process_excel_file(filepath):
    """단일 엑셀 파일을 처리하여 데이터를 추출하고 결합합니다."""
    try:
        # 1. 세금계산서 시트 데이터 추출
        df_invoice = pd.read_excel(filepath, sheet_name=SHEET_CONFIG['tax_invoice']['sheet_name'], header=SHEET_CONFIG['tax_invoice']['header_row'])
        invoice_cols = SHEET_CONFIG['tax_invoice']['columns']
        valid_invoice_cols = {k: v for k, v in invoice_cols.items() if k in df_invoice.columns}
        df_invoice = df_invoice.dropna(subset=valid_invoice_cols.keys(), how='all')
        df_invoice = df_invoice[valid_invoice_cols.keys()].rename(columns=valid_invoice_cols)
        invoice_data_list = df_invoice.to_dict('records')

        # 2. 품목 시트 데이터 추출
        df_items = pd.read_excel(filepath, sheet_name=SHEET_CONFIG['items']['sheet_name'], header=SHEET_CONFIG['items']['header_row'])
        items_cols = SHEET_CONFIG['items']['columns']
        valid_items_cols = {k: v for k, v in items_cols.items() if k in df_items.columns}
        df_items = df_items.dropna(subset=valid_items_cols.keys(), how='all')
        df_items = df_items[valid_items_cols.keys()].rename(columns=valid_items_cols)
        items_data_grouped = {key: group.to_dict('records') for key, group in df_items.groupby('approval_no')}

        # 3. 데이터 결합
        for record in invoice_data_list:
            approval_no = record.get('approval_no')
            if approval_no and approval_no in items_data_grouped:
                record['items'] = items_data_grouped[approval_no]
            # 데이터 타입 정리
            record['issue_date'] = pd.to_datetime(record['issue_date']).strftime('%Y-%m-%d')
            record['total_amount'] = int(record['total_amount'])

        return invoice_data_list

    except Exception as e:
        print(f"  [오류] 파일 처리 실패 '{os.path.basename(filepath)}': {e}")
        return None

def main():
    if not os.path.exists(SOURCE_FOLDER):
        print(f"❌ 오류: 원본 데이터 폴더 '{SOURCE_FOLDER}'를 찾을 수 없습니다.")
        return

    all_invoices = []
    print(f"🚀 '{SOURCE_FOLDER}' 폴더의 엑셀 파일 통합을 시작합니다...")
    
    file_list = [f for f in os.listdir(SOURCE_FOLDER) if f.endswith(('.xlsx', '.xls'))]
    
    for filename in file_list:
        filepath = os.path.join(SOURCE_FOLDER, filename)
        print(f"  - 처리 중: {filename}")
        invoice_records = process_excel_file(filepath)
        if invoice_records:
            all_invoices.extend(invoice_records)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_invoices, f, ensure_ascii=False, indent=4)
        
    print("\n" + "="*50)
    print(f"✅ 성공! 총 {len(all_invoices)}개의 세금계산서 데이터를 통합하여")
    print(f"'{OUTPUT_FILE}' 파일로 저장했습니다.")
    print("="*50)

if __name__ == "__main__":
    main()