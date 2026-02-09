import os
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from django.conf import settings

def get_sheets_service():
    key_path = os.path.join(settings.BASE_DIR, 'service-account-key.json')
    
    if not os.path.exists(key_path):
        # Local development placeholder or environment variable fallback
        key_json = os.environ.get('GOOGLE_SERVICE_ACCOUNT_KEY')
        if key_json:
            info = json.loads(key_json)
        else:
            raise FileNotFoundError(f"Service account key not found at {key_path}")
    else:
        with open(key_path, 'r') as f:
            info = json.load(f)
            
    credentials = service_account.Credentials.from_service_account_info(
        info, scopes=['https://www.googleapis.com/auth/spreadsheets']
    )
    return build('sheets', 'v4', credentials=credentials)

def ensure_sheet_exists(service, spreadsheet_id, sheet_name):
    """
    Check if a sheet exists in the spreadsheet, and create it if it doesn't.
    """
    spreadsheet = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
    sheets = spreadsheet.get('sheets', [])
    sheet_titles = [s['properties']['title'] for s in sheets]
    
    if sheet_name not in sheet_titles:
        body = {
            'requests': [{
                'addSheet': {
                    'properties': {
                        'title': sheet_name
                    }
                }
            }]
        }
        service.spreadsheets().batchUpdate(
            spreadsheetId=spreadsheet_id,
            body=body
        ).execute()

def export_to_sheet(spreadsheet_id, sheet_name, headers, data):
    """
    Export data to a specific sheet. 
    It ensures the sheet exists, clears it, and writes headers + data.
    """
    service = get_sheets_service()
    sheet = service.spreadsheets()

    # 0. シートが存在することを確認
    ensure_sheet_exists(service, spreadsheet_id, sheet_name)

    # 1. 既存のデータをクリア (ヘッダー含め)
    sheet.values().clear(
        spreadsheetId=spreadsheet_id,
        range=f"'{sheet_name}'!A1:Z5000"
    ).execute()

    # 2. ヘッダーとデータを準備
    values = [headers] + data

    # 3. 書き込み
    if data:
        body = {
            'values': values
        }
        sheet.values().update(
            spreadsheetId=spreadsheet_id,
            range=f"'{sheet_name}'!A1",
            valueInputOption='RAW',
            body=body
        ).execute()
    else:
        # データがない場合でもヘッダーだけ書き込む
        body = {
            'values': [headers]
        }
        sheet.values().update(
            spreadsheetId=spreadsheet_id,
            range=f"'{sheet_name}'!A1",
            valueInputOption='RAW',
            body=body
        ).execute()

    return True

def append_row_to_sheet(spreadsheet_id, sheet_name, row_data):
    """
    Append a single row to a specific sheet. 
    It ensures the sheet exists and then appends the row.
    """
    service = get_sheets_service()
    sheet = service.spreadsheets()

    # 0. シートが存在することを確認
    ensure_sheet_exists(service, spreadsheet_id, sheet_name)

    # 1. データの準備
    body = {
        'values': [row_data]
    }

    # 2. 末尾への追記 (APPEND)
    sheet.values().append(
        spreadsheetId=spreadsheet_id,
        range=f"'{sheet_name}'!A1",
        valueInputOption='RAW',
        body=body
    ).execute()

    return True
