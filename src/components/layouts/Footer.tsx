import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Image
                src="/navgurukul-logo.png"
                alt="NavGurukul"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-sm font-semibold">NavGurukul</span>
                <span className="text-sm font-bold">Placement automation</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Placement portal built for NavGurukul learners and alumni.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="#features"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs/saved"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  Saved Jobs
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">For Students</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  href="/profile/view"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/profile/wizard"
                  className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                >
                  Complete Profile
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">For Placement Team</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="text-muted-foreground">
                  Admin dashboards and resume review tools are available to authorized placement admins.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Placement automation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

