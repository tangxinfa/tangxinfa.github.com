#include <stdio.h>
#include <sys/types.h>
#include <unistd.h>
#include <stdlib.h>
#include <signal.h>

void daemon_init() {
    int i;
    pid_t pid;
    
    if (pid = fork()) {
        int status = EXIT_FAILURE;
        waitpid(pid, &status, 0);
        status = WEXITSTATUS(status);
        exit(status);
    }

    setsid();
    signal(SIGHUP, SIG_IGN);

    if (pid = fork()) {
        int status = EXIT_FAILURE;
        waitpid(pid, &status, 0);
        status = WEXITSTATUS(status);
        exit(status);
    }

    umask(0);
}

int main(int argc, char* argv[]) {
    if (setuid(0) == -1) {
        perror("setuid");
        fprintf(stderr, "config: chown root:root %s; chmod 4755 %s\n", argv[0], argv[0]);
        return EXIT_FAILURE;
    }

    daemon_init();

    FILE* fp = popen(argv[1], "r");
    if (NULL == fp) {
        fprintf(stderr, "popen failed\n");
        return EXIT_FAILURE;
    }
    int status = pclose(fp);
    if (-1 == status) {
        fprintf(stderr, "pclose failed\n");
        return EXIT_FAILURE;
    }

    status = WEXITSTATUS(status);
    return status;
}
