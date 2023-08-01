using DemoAspNetAPI.Context;
using DemoAspNetAPI.Helpers;
using DemoAspNetAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace DemoAspNetAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDBContext _dbContext;

        public UserController(AppDBContext appDBContext)
        {
            _dbContext = appDBContext;
        }

        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] User userObj)
        {
            if (userObj == null)
                return BadRequest();

            var user = await _dbContext.Users.FirstOrDefaultAsync(
                x=>x.Username==userObj.Username);

            if (user == null)
                return NotFound(new
                {
                    Message = "Invalid Username!"
                });

            if(!PasswordHasher.VerifyPassword(userObj.Password, user.Password)) 
                return BadRequest(new
                {
                    Message = "Invalid Username or Password"
                });

            user.Token = CreateJwt(user);

            return Ok(new
            {
                Token = user.Token,
                Message = "Login Success!"
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterUser([FromBody] User userObj)
        {
            if(userObj == null)
                return BadRequest();

            if (await CheckUsernameExistAsync(userObj.Username))
                return BadRequest(new{Message = "Username is already exist"});

            if (await CheckEmailExistAsync(userObj.Email))
                return BadRequest(new { Message = "Email is already exist" });

            var pass = CheckPasswordStrength(userObj.Password);
            if(!string.IsNullOrEmpty(pass))
                return BadRequest(new { Message = pass });

            userObj.Password = PasswordHasher.HashPassword(userObj.Password);
            userObj.Role = "User";
            userObj.Token = string.Empty;

            await _dbContext.Users.AddAsync(userObj);
            await _dbContext.SaveChangesAsync();

            return Ok(new
            {
                Message = "Registered Successfully!"
            });
        }

        private Task<bool> CheckUsernameExistAsync(string username)
            => _dbContext.Users.AnyAsync(x => x.Username == username);

        private Task<bool> CheckEmailExistAsync(string email)
            => _dbContext.Users.AnyAsync(x => x.Email == email);

        private string CheckPasswordStrength(string password)
        {
            StringBuilder sb = new StringBuilder();

            if (password.Length < 8 || password.Length > 16)
                sb.Append("Password length should be 8 to 16"+Environment.NewLine);

            if(!(Regex.IsMatch(password, "[a-z]") 
                && Regex.IsMatch(password, "[A-Z]") 
                && Regex.IsMatch(password, "[0-9]")))
                sb.Append("Password should be AlphaNumeric atleast one Capital and Small letter"+Environment.NewLine);

            if (!(Regex.IsMatch(password, "[!,@,#,$,%,&,*,_,.]")))
                sb.Append("Password should contain !,@,#,$,%,&,*,_,." + Environment.NewLine);

            return sb.ToString();
        }

        private string CreateJwt(User user)
        {
            var jwtTokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes("abcdefghijklmnopqrstuvwxyz");
            var identity = new ClaimsIdentity(
                new Claim[]
                {
                    new Claim(ClaimTypes.Role, user.Role),
                    new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                });
            var credentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = identity,
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = credentials
            };

            var token = jwtTokenHandler.CreateToken(tokenDescriptor);

            return jwtTokenHandler.WriteToken(token);
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<User>> GetAllUsers()
        {
            return Ok(await _dbContext.Users.ToListAsync());
        }
    }
}
