import argparse

from app.services.report_service import ReportService
from app.db import get_session


def main() -> None:
    parser = argparse.ArgumentParser(description="Trigger a manual report refresh.")
    parser.add_argument("--account-id", required=True)
    parser.add_argument("--domain", required=True)
    parser.add_argument("--timeframe", default="last_7d")
    args = parser.parse_args()

    service = ReportService()
    with get_session() as session:
        run = service.generate_report(
            session,
            account_id=args.account_id,
            domain=args.domain,
            timeframe=args.timeframe,
        )
    print(f"Report generated: {run.id}")


if __name__ == "__main__":
    main()

