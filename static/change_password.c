#include <sys/types.h>
#include <pwd.h>
#include <shadow.h>
#include <errno.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#define __USE_GNU
#include <crypt.h>


/**
 * 验证帐号密码.
 *
 * @param username 帐号名称.
 * @param password 帐号密码.
 *
 * @return 0 表示验证通过，ENOENT 表示用户不存在，EINVAL 表示密码错误.
 */
static int verifyPassword(const char* username, const char* password)
{
    struct passwd* pw = getpwnam(username);
    endpwent();

    if (! pw) {
        return ENOENT;
    }

    struct spwd* sp = getspnam(pw->pw_name);
    endspent();

    if (! sp) {
        return ENOENT;
    }

    char* correct = sp ? sp->sp_pwdp : pw->pw_passwd;
    if (! correct) {
        return ENOENT;
    }

    /// Empty password.
    if (password[0] == '\0' && correct[0] == '\0') {
        return 0;
    }

    struct crypt_data data;
    data.initialized = 0;
    char* encrypted = crypt_r(password, correct, &data);
    if (! encrypted) {
        return EINVAL;
    }

    return strcmp(encrypted, correct) ? EINVAL : 0;
}

/**
 * 修改帐号密码.
 *
 * @param username 帐号名称.
 * @param password 帐号密码.
 *
 * @return 0 表示修改成功，ENOENT 表示用户不存在，EINVAL 表示密码错误.
 */
static int changePassword(const char* username, const char* password)
{
    char command[256] = {0};
    snprintf(command, sizeof(command), "(echo '%s'; sleep 1; echo '%s') | passwd '%s' > /dev/null", password, password, username);
    system(command);
    return verifyPassword(username, password);
}

int main(int argc, char *argv[])
{
    if (argc != 3) {
        fprintf(stderr, "usage: %s <username> <password>\n", argv[0]);
        return 1;
    }

    const char* username = argv[1];
    const char* password = argv[2];

    int error = changePassword(username, password);

    if (error != 0) {
        fprintf(stderr, "changePassword error: %d\n", error);
    }

    return error;
}
